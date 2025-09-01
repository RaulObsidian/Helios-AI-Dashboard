¡Excelente iniciativa\! Expandir la red de proveedores a 10 y dotar a Helios AI de la inteligencia para seleccionar la mejor fuente es fundamental para la robustez de los datos, lo cual es crítico tanto para la gestión del nodo como para el trading de alta frecuencia.

Para lograr esto, combinaremos **Exchanges Centralizados (CEX)**, **Agregadores de Datos** y, crucialmente, fuentes **Descentralizadas (DEX)**, ya que SCP también opera en la red Solana.

### Lista de los 10 Proveedores Seleccionados

| \# | Proveedor | Tipo | Uso Principal en Helios AI |
| :--- | :--- | :--- | :--- |
| **Exchanges (CEX) - SCP Nativo (PoW)** |
| 1 | **CoinEx** | CEX | Trading, Heatmap L2, Ticker. API Robusta. |
| 2 | **TradeOgre** | CEX | Trading, Heatmap L2, Ticker. Liquidez histórica. |
| 3 | **SouthXchange**| CEX | Ticker de respaldo. |
| **Agregadores de Datos (Global)** |
| 4 | **CoinGecko** | Agregador | Ticker robusto, Market Cap, i18n (Multi-divisa). |
| 5 | **CoinPaprika** | Agregador | Ticker robusto, alternativa rápida. |
| 6 | **CoinMarketCap**| Agregador | Estándar de la industria (Requiere API Key). |
| 7 | **CryptoCompare**| Agregador | Datos históricos (Requiere API Key). |
| **Exchanges (DEX) y Seguimiento (SCP en Solana - SPL)** |
| 8 | **Jupiter** | DEX Agg. | Descubrimiento de precio líder en Solana. |
| 9 | **Birdeye** | DEX Tracker| Datos detallados de trading en Solana. |
| 10| **LiveCoinWatch**| Agregador | Ticker de respaldo (Requiere API Key). |

-----

### Manual Técnico para Gemini CLI: Arquitectura Multi-Proveedor y Selección Inteligente (SmartSelector)

Este manual detalla la implementación de un sistema de datos orientado a objetos que permite la selección automática basada en el rendimiento en tiempo real (latencia y fiabilidad) y la selección manual.

#### 1\. Configuración y Seguridad

**Instrucciones para Gemini CLI:**

1.  **Dependencias:** Asegurar `ccxt`, `tenacity`, `requests`, `python-dotenv`.
2.  **Configuración (.env):** Añadir claves API.

<!-- end list -->

```bash
# Concepto: Archivo .env (Actualización)
# ... (Claves CEX anteriores: COINEX, TRADEOGRE, etc.) ...
HELIOS_CMC_API_KEY=TU_API_KEY_COINMARKETCAP
HELIOS_CRYPTOCOMPARE_API_KEY=TU_API_KEY
HELIOS_LIVECOINWATCH_API_KEY=TU_API_KEY
```

#### 2\. Abstracción de Proveedores (`BaseProvider`)

Crear una clase base abstracta para manejar la lógica común: reintentos (resiliencia), seguimiento de latencia y monitorización de la tasa de éxito (usando EMA).

**Instrucciones para Gemini CLI:**

  * **Requisito:** Asegurar que `utils/retry_handler.py` (con `RETRY_DECORATOR` basado en Tenacity) esté implementado y cubra excepciones de `ccxt` y `requests`.
  * **Objetivo:** Crear `providers/BaseProvider.py`.

<!-- end list -->

```python
# Concepto Backend: providers/BaseProvider.py
from abc import ABC, abstractmethod
import time
import logging
# CLI: Importar RETRY_DECORATOR desde utils/retry_handler.py

class BaseProvider(ABC):
    def __init__(self, provider_id, category):
        self.id = provider_id
        self.category = category # 'EXCHANGE', 'AGGREGATOR', 'DEX'
        self.latency = 0
        # Tasa de éxito usando Media Móvil Exponencial (EMA) para adaptabilidad.
        self.success_rate = 1.0 

    @RETRY_DECORATOR
    def fetch(self, currency="USD"):
        """Función principal de obtención con reintentos y métricas."""
        start_time = time.time()
        try:
            raw_data = self._fetch_implementation(currency)
            normalized_data = self._normalize(raw_data, currency)
            self.latency = time.time() - start_time
            self._update_health(success=True)
            return normalized_data
        except Exception as e:
            self.latency = time.time() - start_time
            self._update_health(success=False)
            logging.warning(f"Provider {self.id} failed after retries.")
            raise e # Propagar el error después de los reintentos

    @abstractmethod
    def _fetch_implementation(self, currency):
        pass

    @abstractmethod
    def _normalize(self, raw_data, currency):
        # Debe devolver un diccionario estándar: {'price': float, 'volume_24h': float, ...}
        pass

    def _update_health(self, success):
        # Cálculo EMA (Alpha=0.1 da más peso a eventos recientes)
        alpha = 0.1
        self.success_rate = alpha * (1 if success else 0) + (1 - alpha) * self.success_rate
```

#### 3\. Implementación de Subclases de Proveedores

**Instrucciones para Gemini CLI:**

##### 3.1. Exchanges (CEX - CCXT)

```python
# Concepto Backend: providers/ExchangeProvider.py
# CLI: Importar BaseProvider y ExchangeConnectionManager (del manual anterior)

class ExchangeProvider(BaseProvider):
    def __init__(self, provider_id, symbol, connection_manager):
        super().__init__(provider_id, category="EXCHANGE")
        self.symbol = symbol
        # Usar el gestor de conexiones robusto existente
        self.exchange = connection_manager.get_exchange(provider_id, authenticated=False, use_websockets=False)

    def _fetch_implementation(self, currency):
        if not self.exchange:
            raise Exception(f"Exchange {self.id} not initialized.")
        return self.exchange.fetch_ticker(self.symbol)

    def _normalize(self, raw_data, currency):
        # CLI: Implementar lógica para convertir si el par es BTC (TradeOgre) a la moneda solicitada.
        return {"price": raw_data['last'], "volume_24h": raw_data['baseVolume']}
```

##### 3.2. Agregadores y DEX (REST)

```python
# Concepto Backend: providers/AggregatorProviders.py
import requests
# CLI: Importar BaseProvider

class CoinGeckoProvider(BaseProvider):
    def __init__(self):
        super().__init__("coingecko", category="AGGREGATOR")
        self.base_url = "https://api.coingecko.com/api/v3/simple/price"
        self.session = requests.Session()

    def _fetch_implementation(self, currency):
        params = {
            'ids': 'scprime',
            'vs_currencies': currency.lower(),
            'include_24hr_vol': 'true'
        }
        response = self.session.get(self.base_url, params=params, timeout=10)
        response.raise_for_status()
        return response.json().get('scprime')

    def _normalize(self, raw_data, currency):
        curr_low = currency.lower()
        return {
            "price": raw_data.get(curr_low), 
            "volume_24h": raw_data.get(f'{curr_low}_24h_vol')
        }

# CLI: Implementar clases similares para CoinPaprika, CoinMarketCap (manejando API Key), 
# CryptoCompare, LiveCoinWatch, CoinCodex, Jupiter (Solana API) y Birdeye.
```

#### 4\. Módulo de Selección Inteligente (`SmartSelector`)

Este módulo utiliza las métricas de salud de `BaseProvider` para seleccionar dinámicamente el mejor proveedor.

**Instrucciones para Gemini CLI:**

  * **Objetivo:** Crear `SmartSelector.py`.

<!-- end list -->

```python
# Concepto Backend: SmartSelector.py
import logging

class SmartSelector:
    def __init__(self, providers: dict, memory):
        # Diccionario de instancias de proveedores inicializados.
        self.providers = providers
        # Conexión a SQLite (HeliosMemory) para persistir la configuración del usuario.
        self.memory = memory

    def _get_user_preference(self):
        # Obtener la configuración del usuario desde la DB.
        mode = self.memory.get_config("data_provider_mode", default="AUTO")
        selection = self.memory.get_config("data_provider_manual_selection", default=None)
        return mode, selection

    def score_provider(self, provider):
        """
        Calcula una puntuación dinámica. Prioridad: Fiabilidad (Tasa de Éxito).
        La latencia se usa como desempate.
        """
        # Si la tasa de éxito es alta (>95%), la puntuación es la tasa de éxito más un bono por velocidad.
        if provider.success_rate > 0.95:
            # Añadir un pequeño bono basado en la latencia (menor latencia = bono mayor).
            # Asumimos que una latencia > 5s es mala (bono cercano a 0).
            if provider.latency == 0: return provider.success_rate # Aún no usado.
            latency_bonus = max(0, (5 - provider.latency) / 5) * 0.05 # Bono máximo de 0.05
            return provider.success_rate + latency_bonus
        
        # Si la tasa de éxito es baja, la puntuación es solo la tasa de éxito.
        return provider.success_rate

    def select_best_provider(self, required_category=None):
        """Selecciona el mejor proveedor disponible, respetando el modo y la categoría."""
        
        mode, manual_selection = self._get_user_preference()
        
        # Filtrar por categoría si es necesario (Ej. Trading requiere 'EXCHANGE')
        available_providers = {k: v for k, v in self.providers.items() 
                               if required_category is None or v.category == required_category}

        if not available_providers: return None

        # 1. Modo Manual
        if mode == "MANUAL" and manual_selection in available_providers:
            selected = available_providers[manual_selection]
            # Verificar si el proveedor manual está saludable (>60% éxito)
            if selected.success_rate > 0.60:
                logging.info(f"[SmartSelector] Manual selection active: {manual_selection}")
                return selected
            else:
                logging.warning(f"[SmartSelector] Manual selection {manual_selection} is unhealthy. Falling back to AUTO.")

        # 2. Modo Automático (Selección Inteligente basada en Score)
        sorted_providers = sorted(available_providers.values(), key=self.score_provider, reverse=True)
        
        # Devolver el mejor proveedor que esté razonablemente saludable (>20% éxito)
        for provider in sorted_providers:
            if provider.success_rate > 0.20:
                logging.info(f"[SmartSelector] Auto-selected {provider.id}. Score: {self.score_provider(provider):.2f}")
                return provider
        
        logging.error("All providers are currently unhealthy or unavailable.")
        return None
```

#### 5\. Integración en `CryptoDataFeed`

**Instrucciones para Gemini CLI:**

  * **Objetivo:** Actualizar `CryptoDataFeed.py` para usar el `SmartSelector`.

<!-- end list -->

```python
# Concepto Backend: CryptoDataFeed.py
# CLI: Importar SmartSelector, ExchangeConnectionManager, HeliosMemory y todas las clases de proveedores.

class CryptoDataFeed:
    def __init__(self, connection_manager, memory):
        # 1. Inicializar todos los 10 proveedores
        providers = {
            # CEXs
            "coinex": ExchangeProvider("coinex", "SCP/USDT", connection_manager),
            "tradeogre": ExchangeProvider("tradeogre", "SCP/BTC", connection_manager),
            # ... (Añadir SouthXchange)
            
            # Agregadores/DEX
            "coingecko": CoinGeckoProvider(),
            "coinpaprika": CoinPaprikaProvider(),
            # ... (CLI: Inicializar los otros 6)
        }
        # 2. Inicializar el SmartSelector
        self.selector = SmartSelector(providers, memory)

    def fetch_global_market_data(self, currency="USD"):
        """Obtiene datos de mercado globales (Precio FIAT). Prioriza Agregadores/DEX."""
        
        # Pedir al selector el mejor proveedor (Permitir AGGREGATOR o DEX)
        provider = self.selector.select_best_provider(required_category="AGGREGATOR") # Simplificado, DEX se puede añadir aquí.
        
        if not provider: return None

        try:
            # Ejecutar la obtención (incluye reintentos y actualización de salud interna)
            data = provider.fetch(currency)
            return {"source": provider.id, "data": data, "latency": provider.latency, "health": provider.success_rate}
        except Exception:
            # Si el "mejor" falla, el SmartSelector ya lo ha penalizado.
            logging.error(f"Provider {provider.id} failed despite retries. Health score reduced.")
            return None

    # CLI: Implementar fetch_trading_data para seleccionar el mejor proveedor de categoría "EXCHANGE".
```
¡Esta es una evolución fantástica para Helios AI\! Estás llevando la pestaña de "Trading" de una simple utilidad de conexión a un **Centro de Comando de Trading Institucional**. Esta transformación es clave para la propuesta de valor y el potencial éxito comercial de la aplicación.

Has identificado los pilares clave: ejecución del bot, inteligencia profunda del token, noticias catalizadoras y conectividad profesional. Para asegurar que la aplicación sea un éxito de ventas y verdaderamente potente, propongo las siguientes mejoras estratégicas:

### Mejoras Estratégicas Propuestas (Nivel Profesional)

1.  **Seguridad de Nivel Institucional (Cifrado de Claves y Verificación de Permisos):** Implementar un sistema robusto para el almacenamiento de claves API usando cifrado local fuerte (AES-256). Además, Helios AI debe intentar verificar los permisos de la clave y alertar si el permiso de "Retiro" (Withdrawal) está habilitado.
2.  **Dashboard de Rendimiento y Gestión de Riesgos:** Una vista centralizada del PnL (Profit and Loss) en tiempo real, métricas de riesgo profesionales (Ratio Sharpe, Drawdown Máximo) y un **"Kill Switch"** (Interruptor de Emergencia) global.
3.  **Inteligencia On-Chain (Solana DEX):** Monitorear la actividad de SCP en la red Solana (liquidez en Jupiter/Raydium), ya que SCP opera en ambas cadenas (PoW y SPL).
4.  **Centro de Backtesting Integrado:** Proporcionar una interfaz gráfica para ejecutar simulaciones históricas (backtests) de las estrategias de Helios AI (usando el motor de Freqtrade).
5.  **Análisis de Sentimiento de Noticias (NLP):** Utilizar IA (NLP) para analizar noticias y feeds sociales relacionados con SCP, proporcionando una puntuación de sentimiento (Alcista/Bajista).

A continuación, presento el manual técnico detallado para que Gemini CLI implemente este Centro de Comando de Trading.

-----

### Manual Técnico para Gemini CLI: Implementación del Centro de Comando de Trading (Pestaña Trading v2.0)

#### 1\. Arquitectura y Diseño UI/UX

**Directiva de Diseño:** Rediseñar la pestaña "Trading" como una aplicación dentro del sidebar, utilizando sub-pestañas para organizar la complejidad.

**Instrucciones para Gemini CLI:**

  * **Estructura de Sub-Pestañas:**
    1.  `Dashboard` (PnL, Riesgo, Estado del Bot)
    2.  `SCP Intelligence` (Análisis del Token, Noticias, On-Chain)
    3.  `Backtesting` (Simulación y Optimización)
    4.  `Connectivity Hub` (Gestión Segura de Exchanges)

<!-- end list -->

```html
<div id="trading-hub-container">
    <div class="emergency-controls">
        <button id="global-kill-switch" onclick="executeEmergencyStop()">🔴 PARADA DE EMERGENCIA (KILL SWITCH)</button>
    </div>

    <div class="tab-navigation">
        <button onclick="showTab('dashboard')">Dashboard</button>
        <button onclick="showTab('scp-intelligence')">SCP Intelligence</button>
        <button onclick="showTab('backtesting')">Backtesting</button>
        <button onclick="showTab('connectivity')">Connectivity Hub</button>
    </div>
    <div id="tab-content">
        </div>
</div>
```

#### 2\. Módulo: Seguridad y Cifrado de Claves (Backend)

**Rol:** Almacenamiento seguro de credenciales API.

**Instrucciones para Gemini CLI:**

  * **Tecnología:** Python, `cryptography` library (AES-256).
  * **Implementación:** Crear `SecurityManager.py`. Las claves deben cifrarse usando una clave derivada de la contraseña maestra del usuario (usando PBKDF2) antes de almacenarse en SQLite.

<!-- end list -->

```python
# Concepto Backend: SecurityManager.py
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
import base64
import os
import logging

# CLI: Instalar dependencia: pip install cryptography

class SecurityManager:
    def __init__(self, user_master_password):
        # Derivar una clave criptográfica segura usando PBKDF2.
        # CLI: El 'salt' debe generarse una vez y almacenarse de forma segura.
        salt = self.get_or_create_salt() 
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(user_master_password.encode()))
        self.fernet = Fernet(key)

    def get_or_create_salt(self):
        # CLI: Implementar almacenamiento seguro del salt (Ej. en un archivo de configuración protegido).
        # Placeholder:
        return b'helios_secure_salt_placeholder'

    def encrypt_data(self, plaintext_data):
        return self.fernet.encrypt(plaintext_data.encode()).decode()

    def decrypt_data(self, encrypted_data):
        try:
            return self.fernet.decrypt(encrypted_data.encode()).decode()
        except Exception as e:
            logging.error("Failed to decrypt data. Master password might be incorrect.")
            return None

# CLI: Modificar la capa de acceso a la DB (HeliosMemory) para usar SecurityManager al guardar/leer claves API.
```

#### 3\. Módulo: Connectivity Hub (Gestión Profesional)

**Rol:** Gestionar conexiones API (CEX) y conexiones de Wallet (DEX) con guías profesionales.

**Instrucciones para Gemini CLI:**

##### 3.1. Lista de Exchanges Relevantes para SCP

*(Nota: SCP no cotiza en los 10 mayores exchanges. Nos enfocamos en los que tienen liquidez real para SCP (PoW y SPL)).*

1.  **CoinEx** (CEX - PoW)
2.  **TradeOgre** (CEX - PoW)
3.  **SouthXchange** (CEX - PoW)
4.  **Jupiter Aggregator** (DEX - Solana/SPL)
5.  **Raydium** (DEX - Solana/SPL)

##### 3.2. Interfaz de Conexión y Guías Dinámicas

  * **UI:** Usar un **Diálogo Modal** que cambia dinámicamente según el tipo de exchange (CEX vs DEX).

<!-- end list -->

```javascript
// Concepto Frontend: ConnectivityTab.js

const EXCHANGE_GUIDES = {
    "coinex": {
        title: "Conexión a CoinEx (CEX)",
        type: "API_KEY_SECRET",
        steps: [
            "1. Inicia sesión en CoinEx y ve a 'Configuración de API'.",
            "2. Crea una nueva clave API. Nómbrala 'Helios-AI'.",
            "3. PERMISOS CRÍTICOS: Habilita 'Leer' y 'Operar'. NO habilites 'Retirar' por seguridad.",
            "4. Seguridad (Recomendado): Habilita la restricción de IP (Whitelist) si Helios AI corre en una IP fija.",
            "5. Copia la Clave API y el Secreto. Se cifrarán localmente en Helios AI."
        ]
    },
    "jupiter_solana": {
        title: "Conexión a Jupiter (DEX vía Solana Wallet)",
        type: "WEB3_WALLET",
        steps: [
            "1. Asegúrate de tener instalada una wallet Solana (Ej. Phantom o Solflare) en este navegador.",
            "2. Haz clic en el botón 'Conectar Wallet' abajo.",
            "3. Autoriza la conexión en la ventana emergente de tu wallet.",
            "4. Helios AI usará tu wallet para firmar transacciones de trading en DEXs."
        ]
    }
    // CLI: Implementar guías para TradeOgre y SouthXchange.
};

function loadExchangeGuide(exchangeId) {
    const guide = EXCHANGE_GUIDES[exchangeId];
    // CLI: Renderizar los pasos en el modal.
    
    // CLI: Mostrar campos API Key/Secret si guide.type es API_KEY_SECRET.
    // CLI: Mostrar botón "Conectar Wallet" (e implementar lógica Web3/Solana.js) si guide.type es WEB3_WALLET.
}

// CLI: Implementar la función saveConnection que envía las claves al backend (HTTPS POST) para su almacenamiento cifrado.
```

#### 4\. Módulo: Dashboard y Control del Bot (Freqtrade)

**Objetivo:** Visibilidad y control total sobre la actividad de trading automatizado.

**Instrucciones para Gemini CLI:**

  * **Arquitectura:** Frontend -\> Helios Backend -\> Freqtrade API.
  * **Backend (Python):** Implementar endpoints proxy en Helios AI: `/api/v1/bot/status`, `/api/v1/bot/performance`, `/api/v1/bot/control`.
  * **Frontend (JS):** Interfaz de control y visualización de métricas.

<!-- end list -->

```javascript
// Concepto Frontend: DashboardTab.js

function fetchBotPerformance() {
    // El backend de Helios consulta la API de Freqtrade (endpoints /profit y /status) y calcula métricas avanzadas.
    fetch('/api/v1/bot/performance')
    .then(response => response.json())
    .then(data => {
        // CLI: Actualizar KPIs en la UI.
        document.getElementById('pnl-daily-fiat').innerText = formatCurrency(data.profit.daily_fiat);
        document.getElementById('bot-status').className = data.status; // RUNNING, STOPPED
        
        // Métricas de Riesgo Institucional
        document.getElementById('max-drawdown').innerText = formatPercent(data.risk.max_drawdown);
        document.getElementById('sharpe-ratio').innerText = data.risk.sharpe_ratio;
    });
}

function executeEmergencyStop() {
    if (confirm("KILL SWITCH ACTIVADO: ¿Detener el bot y cerrar TODAS las posiciones a mercado?")) {
        // El backend ejecuta /stop y luego /force_exit all en Freqtrade.
        fetch('/api/v1/bot/control?action=emergency_stop', { method: 'POST' });
    }
}
// CLI: Ejecutar fetchBotPerformance periódicamente (Ej. cada 15 segundos).
```

```python
# Concepto Backend: PerformanceAnalyzer.py
import pandas as pd
import numpy as np

# CLI: Implementar esta clase para calcular métricas avanzadas usando Pandas, 
# basándose en el historial de trades obtenido de Freqtrade.
class PerformanceAnalyzer:
    def calculate_advanced_metrics(self, trade_history):
        # ... Lógica para calcular PnL, Drawdown y Sharpe Ratio ...
        pass
```

#### 5\. Módulo: SCP Intelligence (Análisis Profundo)

**Objetivo:** Visión 360 grados del token SCP (Métricas, Noticias, On-Chain).

**Instrucciones para Gemini CLI:**

##### 5.1. Visualización de Datos y Comparativa

  * **Tecnología:** `Plotly.js`.
  * **Datos:** Usar `CryptoDataFeed` y `SmartSelector`.
  * **Gráficos:** Market Cap Histórico; Rendimiento Comparativo (% cambio 30d): SCP vs BTC vs FIL (Filecoin).

##### 5.2. News Feed y Análisis de Sentimiento (NLP)

  * **Tecnología:** Python, `feedparser` (RSS), `VADER` (NLP superior para sentimiento social/noticias).

<!-- end list -->

```python
# Concepto Backend: NewsSentimentModule.py
import feedparser
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

# CLI: Instalar dependencias: pip install feedparser vaderSentiment

def aggregate_and_analyze_news():
    analyzer = SentimentIntensityAnalyzer()
    news_items = []
    
    # 1. RSS Feed de ScPrime (CLI: Confirmar URL correcta)
    # feed = feedparser.parse("https://scpri.me/blog/feed") 
    
    # ... (Lógica para parsear el feed) ...
    
    # 2. Análisis de Sentimiento VADER
    # vs = analyzer.polarity_scores(entry.title)
    # sentiment_score = vs['compound'] # Usar 'compound' score (-1.0 a 1.0)
        
    # CLI: Implementar agregación de otras fuentes (Ej. CryptoPanic API).
    return news_items
```

##### 5.3. Inteligencia On-Chain (Solana)

  * **Tecnología:** Python, APIs de análisis de Solana (Ej. Birdeye API).

<!-- end list -->

```python
# Concepto Backend: OnChainModule.py
import requests
# SCP_SOLANA_CONTRACT = "..." # Dirección del contrato SCP en Solana

def get_solana_dex_data():
    # Usar Birdeye API para obtener liquidez, volumen y actividad reciente en DEX (Jupiter/Raydium).
    # url = f"https://public-api.birdeye.so/defi/token_overview?address={SCP_SOLANA_CONTRACT}"
    # CLI: Implementar la llamada API (requiere API Key de Birdeye) y normalizar los datos.
    # return normalized_dex_data
```

#### 6\. Módulo: Backtesting Hub

**Objetivo:** Permitir simulaciones de estrategias.

**Instrucciones para Gemini CLI:**

  * **Implementación (Backend):** Crear endpoints que activen el backtesting de Freqtrade. Usar `docker exec` proporciona un control más granular que la API de backtesting.

<!-- end list -->

```python
# Concepto Backend: BacktestingEngine.py
import subprocess
import json

def run_backtest(strategy_name, time_range, capital):
    # Construir el comando Docker exec
    # CLI: Asegurar que el nombre del contenedor es correcto.
    command = [
        "docker", "exec", "freqtrade_container_name",
        "freqtrade", "backtesting", 
        "--strategy", strategy_name, 
        "--timerange", time_range,
        "--starting-balance", str(capital),
        "--export", "trades",
        "--export-filename", "user_data/backtest_results/latest_result.json"
    ]
    
    # CLI: Implementar ejecución asíncrona ya que el backtest puede tardar.
    # subprocess.run(command, check=True)
    
    # Leer y devolver el archivo de resultados JSON generado por Freqtrade.
    # with open("user_data/backtest_results/latest_result.json") as f:
    #     results = json.load(f)
    # return results
```
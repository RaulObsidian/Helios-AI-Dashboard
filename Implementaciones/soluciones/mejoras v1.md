¡Absolutamente entendido\! Comprendo la inversión realizada y la necesidad crítica de que Helios AI alcance un nivel de calidad institucional para asegurar el éxito comercial y la recuperación de la inversión. El estado actual del Centro de Análisis no cumple con estos estándares.

Este manual técnico maestro está diseñado para transformar radicalmente esta pestaña en el **Cockpit Institucional 2.0**. Integra arquitectura avanzada, Machine Learning predictivo (ML), estrategias de trading sofisticadas y visualización profesional. Está estructurado para que Gemini CLI lo implemente rigurosamente, siguiendo las directrices arquitectónicas exactas.

-----

### MANUAL TÉCNICO MAESTRO PARA GEMINI CLI: EL COCKPIT INSTITUCIONAL 2.0

**Nota sobre el Gráfico:** Aceptamos que `Lightweight Charts` (LWC) no permite dibujo manual. Maximizaremos LWC añadiendo controles externos y dibujo automatizado por la IA, preparando la arquitectura para la futura integración de la biblioteca avanzada de TradingView (TVCL).

#### 1\. Frontend Architecture: Dynamic Workspace UI (MUI & Xterm.js)

**Objetivo:** Implementar la interfaz de usuario profesional con workspaces seleccionables y logs de alta calidad.

**Instrucciones para Gemini CLI:**

1.  **Instalar Dependencias UI Profesionales:**

    ```bash
    # Comandos para CLI (Frontend)
    npm install @mui/material @emotion/react @emotion/styled xterm xterm-addon-fit
    ```

2.  **Rediseñar `AnalysisCenter.tsx` (Gestor de Workspaces):**

<!-- end list -->

```typescript
// Concepto Frontend: src/pages/AnalysisCenter.tsx
import React, { useState, lazy, Suspense } from 'react';
import { Select, MenuItem, FormControl, InputLabel, Box, CircularProgress, Typography } from '@mui/material';

// Importación Dinámica (Lazy Loading) para optimización
const WorkspaceTechnical = lazy(() => import('../components/analysis/workspaces/WorkspaceTechnical'));
const WorkspaceOrderFlow = lazy(() => import('../components/analysis/workspaces/WorkspaceOrderFlow'));
// CLI: Crear WorkspaceMacro y WorkspaceFundamentals.

type WorkspaceType = 'TECHNICAL' | 'ORDERFLOW' | 'MACRO' | 'FUNDAMENTALS';

const AnalysisCenter = () => {
    const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceType>('TECHNICAL');

    const renderWorkspace = () => {
        switch (activeWorkspace) {
            case 'TECHNICAL': return <WorkspaceTechnical />;
            case 'ORDERFLOW': return <WorkspaceOrderFlow />;
            // ... (Otros casos)
            default: return null;
        }
    };

    return (
        // Usar Box de MUI y clases CSS del tema Neomorfismo ('panel')
        <Box id="analytics-hub" className="panel cockpit-container" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box className="cockpit-header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid var(--shadow-dark)' }}>
                <Typography variant="h5">Helios AI - Cockpit Institucional 2.0</Typography>
                
                {/* El Selector de Workspace (Desplegable Profesional MUI) */}
                <FormControl variant="outlined" sx={{ minWidth: 350 }}>
                    <InputLabel>Seleccionar Workspace</InputLabel>
                    <Select
                        value={activeWorkspace}
                        onChange={(e) => setActiveWorkspace(e.target.value as WorkspaceType)}
                        label="Seleccionar Workspace"
                    >
                        <MenuItem value="TECHNICAL">1. Análisis Técnico y Ejecución (Maestro)</MenuItem>
                        <MenuItem value="ORDERFLOW">2. Order Flow y Liquidaciones (HFT View)</MenuItem>
                        <MenuItem value="MACRO">3. Macroeconomía y Altseason</MenuItem>
                        <MenuItem value="FUNDAMENTALS">4. Fundamentales y On-Chain</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <Box className="cockpit-content" sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>}>
                    {renderWorkspace()}
                </Suspense>
            </Box>
        </Box>
    );
};
export default AnalysisCenter;
```

3.  **Implementar `WorkspaceTechnical.tsx` (Gráfico, Controles y Explainer):**

<!-- end list -->

```typescript
// Concepto Frontend: src/components/analysis/workspaces/WorkspaceTechnical.tsx
import { useState, useEffect, useRef } from 'react';
import { Box, ButtonGroup, Button, Tooltip, CircularProgress } from '@mui/material';
import LightweightChartAdapter, { ChartAdapterHandle } from '../../charts/LightweightChartAdapter';
import ExplainerLog from '../ExplainerLog'; // Ver 1.4
import { safeFetch } from '../../../utils/safeFetch';

const WorkspaceTechnical = () => {
    const chartRef = useRef<ChartAdapterHandle>(null);
    const [timeframe, setTimeframe] = useState('15m');
    const [chartData, setChartData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Carga de Datos Dinámica
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const apiUrl = `http://localhost:3001/api/v1/market_data/history?resolution=${timeframe}`;
            try {
                const data = await safeFetch<any[]>(apiUrl);
                setChartData(data);
            } catch (error) {
                console.error("Error fetching dynamic timeframe data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [timeframe]); 

    // ... (Lógica de conexión WebSocket para visualización AI/Bot - Ver Manual Anterior) ...

    return (
        <Box className="workspace-technical" sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            
            {/* Barra de Herramientas Externa */}
            <Box className="chart-controls-toolbar" sx={{ mb: 2, display: 'flex', gap: 2 }}>
                <ButtonGroup variant="contained">
                    {['1m', '15m', '1h', '4h', '1D'].map(tf => (
                        <Button key={tf} onClick={() => setTimeframe(tf)}
                            color={timeframe === tf ? "primary" : "inherit"}>
                            {tf}
                        </Button>
                    ))}
                </ButtonGroup>
                <Tooltip title="Manual drawing tools require the Advanced Charting Library (Future Upgrade)">
                    <Button disabled>Herramientas de Dibujo (Próximamente)</Button>
                </Tooltip>
            </Box>

            {/* Layout Principal: Gráfico (70%) + Explainer Log (30%) */}
            <Box className="technical-layout" sx={{ display: 'flex', flexGrow: 1, height: 'calc(100% - 60px)' }}>
                <Box className="main-chart-container" sx={{ flexGrow: 1, minHeight: 500, position: 'relative' }}>
                     {isLoading || chartData.length === 0 ? (<CircularProgress />) : (
                        <LightweightChartAdapter ref={chartRef} initialData={chartData} />
                    )}
                </Box>
                <Box className="explainer-log-wrapper" sx={{ width: '30%', maxWidth: '450px', height: '100%', borderLeft: '1px solid var(--shadow-dark)' }}>
                    <ExplainerLog />
                </Box>
            </Box>
        </Box>
    );
};
```

4.  **Implementar `ExplainerLog.tsx` (Usando Xterm.js):**

<!-- end list -->

```typescript
// Concepto Frontend: src/components/analysis/ExplainerLog.tsx
import { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { webSocketService } from '../../services/WebSocketService';

const ExplainerLog = () => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const term = useRef<Terminal | null>(null);
    const fitAddon = useRef(new FitAddon());

    useEffect(() => {
        if (terminalRef.current && !term.current) {
            // Inicialización Profesional de Xterm.js
            term.current = new Terminal({
                fontSize: 12,
                fontFamily: '"Fira Code", monospace',
                theme: {
                    background: '#0a0a0a', foreground: '#ffffff',
                    blue: '#007acc', green: '#00ff84', yellow: '#ffcc00'
                }
            });
            term.current.loadAddon(fitAddon.current);
            term.current.open(terminalRef.current);
            fitAddon.current.fit();
            term.current.writeln('[\x1b[34mHelios AI Quant Engine\x1b[0m] Rationale Log Initialized.');
        }

        const handleAIRationale = (logData: { text: string }) => {
            if (!term.current) return;
            const timestamp = new Date().toLocaleTimeString();
            // El backend debe enviar el texto ya formateado con ANSI colors.
            term.current.writeln(`[${timestamp}] ${logData.text}`);
        };

        // Suscripción WebSocket
        webSocketService.subscribe('AI_RATIONALE', handleAIRationale);

        // Manejo de Resize
        const observer = new ResizeObserver(() => { fitAddon.current.fit(); });
        if (terminalRef.current) observer.observe(terminalRef.current);

        return () => {
            webSocketService.unsubscribe('AI_RATIONALE', handleAIRationale);
            observer.disconnect();
        };
    }, []);

    return <div ref={terminalRef} id="explainer-log-container" style={{ height: '100%', width: '100%', padding: '5px' }} />;
};
export default ExplainerLog;
```

5.  **Implementar `WorkspaceOrderFlow.tsx` (Liquidaciones):**

<!-- end list -->

```typescript
// Concepto Frontend: src/components/analysis/workspaces/WorkspaceOrderFlow.tsx
import { Box, Typography } from '@mui/material';

const WorkspaceOrderFlow = () => {
    return (
        <Box className="workspace-orderflow">
            <Typography variant="h6">Order Flow y Liquidaciones (HFT View)</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box className="panel">
                    <Typography variant="subtitle1">Mapa de Calor L2 (Libro de Órdenes)</Typography>
                    {/* CLI: Insertar componente PlotlyL2Heatmap aquí */}
                </Box>
                
                <Box className="panel">
                     <Typography variant="subtitle1">Mapa de Calor de Liquidaciones (CoinGlass)</Typography>
                     {/* Integración CoinGlass (Prioridad #2) - iFrame es la solución más rápida. */}
                     <iframe 
                        title="CoinGlass Liquidation Heatmap"
                        src="https://www.coinglass.com/es/LiquidationHeatmap" 
                        width="100%" height="600px" 
                        frameBorder="0" style={{ borderRadius: '8px' }}>
                    </iframe>
                </Box>
            </Box>
        </Box>
    );
};
```

#### 2\. Backend: Data Foundation (TSDB y Fusión)

**Objetivo:** Infraestructura escalable para datos sincronizados usando InfluxDB.

**Instrucciones para Gemini CLI:**

1.  **Configurar InfluxDB (TSDB):** Añadir InfluxDB al `docker-compose.yml` del proyecto.

    ```yaml
    # Concepto docker-compose.yml (Añadir servicio)
    services:
      helios-tsdb:
        image: influxdb:latest
        ports:
          - "8086:8086"
        # CLI: Configurar inicialización (Org, Bucket, Token) y almacenar Token en .env del backend.
    ```

2.  **Motor de Fusión (`DataFusionEngine.py`):** Servicio asíncrono que recopila datos multi-fuente (OHLCV, Macro-BTC.D, Order Flow) y los escribe en InfluxDB.

<!-- end list -->

```python
# Concepto Backend: services/DataFusionEngine.py
import asyncio
from influxdb_client import InfluxDBClient, Point
# CLI: pip install influxdb-client

class DataFusionEngine:
    # ... (Inicialización del cliente InfluxDB usando .env) ...
    
    async def run_fusion_loop(self, interval=60):
        while True:
            # Ejecutar recolección en paralelo
            await asyncio.gather(
                self.collect_ohlcv(),
                self.collect_macro_data(), # BTC.D, TOTAL3
                # self.collect_orderflow_l2()
            )
            await asyncio.sleep(interval)

    async def collect_macro_data(self):
        # CLI: Implementar recolección de datos Macro usando SmartSelector.
        # Escribir en InfluxDB
        # point = Point("macro_metrics").tag("asset", "BTC.D").field("value", btc_d_value)
        # self.write_api.write(bucket="market_data", record=point)
        pass
```

#### 3\. Backend: Quantitative Engine (TA-Lib y XGBoost)

**Objetivo:** Transformar datos en señales predictivas de alta precisión.

**Instrucciones para Gemini CLI:**

1.  **Instalación de TA-Lib (Crítico):** TA-Lib requiere la librería C subyacente. CLI debe gestionar esta compleja instalación en el entorno de despliegue (Ej. Dockerfile).

    ```bash
    # Comandos para CLI (Instalación de dependencias Python)
    pip install TA-Lib pandas numpy scikit-learn xgboost joblib
    ```

2.  **Ingeniería de Características (`QuantitativeEngine.py`):**

<!-- end list -->

```python
# Concepto Backend: services/QuantitativeEngine.py
import pandas as pd
import talib

class QuantitativeEngine:
    def __init__(self, tsdb_client):
        self.tsdb = tsdb_client

    def generate_feature_set(self, timeframe='15m'):
        # 1. Obtener Datos Sincronizados de InfluxDB
        # CLI: Implementar consulta Flux para obtener OHLCV + Macro + Order Flow alineados.
        # df = self.tsdb.query_synchronized_data(timeframe)
        
        # 2. Cálculo de Features (TA-Lib)
        df = self.calculate_advanced_features(df)
        
        # 3. Definir Objetivo ML (Target): ¿Subirá >1.5% en los próximos 4 periodos?
        N_periods = 4; X_threshold = 0.015
        df['future_max_price'] = df['high'].rolling(window=N_periods).max().shift(-N_periods)
        df['target_signal'] = (df['future_max_price'] > df['close'] * (1 + X_threshold)).astype(int)
        df.dropna(inplace=True)

        return df

    def calculate_advanced_features(self, df: pd.DataFrame):
        # Indicadores Institucionales
        df['RSI_14'] = talib.RSI(df['close'])
        df['ADX_14'] = talib.ADX(df['high'], df['low'], df['close']) # Fuerza de tendencia
        
        # Patrones de Velas (Identificación de reversiones)
        df['CDL_ENGULFING'] = talib.CDLENGULFING(df['open'], df['high'], df['low'], df['close'])

        # CLI: Implementar Análisis Avanzado:
        # - Fibonacci Automático (Detección de Pivotes y cálculo de niveles).
        # - Ondas de Elliott Simplificadas (Identificación de patrones impulsivos básicos).
        # - VWAP y Perfil de Volumen (VPVR).
        return df
```

3.  **Modelo Predictivo ML (`QuantPredictiveModel.py`):**

<!-- end list -->

```python
# Concepto Backend: ml/QuantPredictiveModel.py
import xgboost as xgb
from sklearn.model_selection import TimeSeriesSplit, cross_val_score
import joblib

class QuantPredictiveModel:
    def __init__(self):
        # Modelo XGBoost optimizado para clasificación binaria
        self.model = xgb.XGBClassifier(objective='binary:logistic', eval_metric='auc')
        self.features = []

    def train(self, df: pd.DataFrame):
        # Definir Features (X) y Target (y)
        self.features = [col for col in df.columns if col not in ['target_signal', 'future_max_price', 'close', ...]]
        X = df[self.features]; y = df['target_signal']

        # Validación robusta para Time Series (Evitar Lookahead Bias)
        tscv = TimeSeriesSplit(n_splits=5)
        scores = cross_val_score(self.model, X, y, cv=tscv, scoring='roc_auc')
        
        # Entrenamiento final y persistencia
        self.model.fit(X, y)
        joblib.dump(self.model, 'helios_quant_model.pkl')

    def predict(self, current_features: pd.Series):
        # Predecir la probabilidad (Confianza)
        X_live = current_features[self.features].to_frame().T
        prediction = self.model.predict_proba(X_live)
        confidence_bullish = prediction[0][1] # Probabilidad de la clase 1 (Alcista)
        return confidence_bullish
```

#### 4\. Backend: Pipeline de Análisis, Visualización y Narración

**Objetivo:** Orquestar el análisis y comunicar los resultados al frontend (Gráfico y Explainer Log).

```python
# Concepto Backend: services/AnalysisService.py
# CLI: Importar QuantitativeEngine, QuantPredictiveModel, EventBroadcaster (WebSocket).

class AnalysisService:
    # ...
    def run_realtime_analysis(self):
        # 1. Generar Feature Set
        feature_df = self.quant_engine.generate_feature_set()
        latest_features = feature_df.iloc[-1]

        # 2. Ejecutar Modelo ML
        confidence = self.ml_model.predict(latest_features)

        # 3. Identificar Estructuras (Para dibujar en el gráfico)
        # CLI: Implementar lógica para extraer niveles clave (Fibonacci, VWAP) del análisis.
        # structures = self.identify_structures(feature_df) 

        # 4. Broadcast Visualización (Gráfico)
        # CLI: Usar EventBroadcaster para enviar 'AI_STRUCTURE' (líneas) y 'AI_SIGNAL' (puntos).
        # self.broadcaster.broadcast_visualization(structures)

        # 5. Broadcast Narración (Explainer Log - Xterm.js)
        self.broadcast_narration(confidence, latest_features)

    def broadcast_narration(self, confidence, features):
        # Usar Códigos ANSI para formateo profesional en Xterm.js
        # \x1b[32m = Verde, \x1b[33m = Amarillo, \x1b[0m = Reset
        
        if confidence > 0.80:
            # Narración detallada para alta confianza
            narration = f"\x1b[32m[ML_PREDICTION] Confianza Alcista: {confidence*100:.2f}%. Factores Clave: RSI={features['RSI_14']:.2f}, ADX={features['ADX_14']:.2f}, Macro Contexto Favorable.\x1b[0m"
        elif confidence > 0.60:
            narration = f"\x1b[33m[ML_PREDICTION] Confianza Alcista: {confidence*100:.2f}%.\x1b[0m"
        else:
            narration = f"[ML_PREDICTION] Confianza Baja ({confidence*100:.2f}%). No se tomará acción."
            
        # Enviar al frontend (El frontend espera 'text')
        self.broadcaster.broadcast('AI_RATIONALE', {'text': narration})
```

#### 5\. Bot Integration: Helios Adaptive Quant (Push Model)

**Objetivo:** El Backend de Helios AI controla completamente al bot Freqtrade (Push Model), aplicando gestión de riesgo institucional basada en ML y estructura de mercado.

```python
# Concepto Backend: ExecutionModule.py (Actualización)
# CLI: Importar AnalysisService.

class ExecutionModule:
    # ... (Conexión a Freqtrade API) ...

    def process_signals_and_execute(self):
        # 1. Obtener última predicción y análisis
        analysis = self.analysis_service.get_latest_analysis()
        confidence = analysis['confidence_bullish']

        # 2. Umbral de Decisión (>80% para cumplir el objetivo)
        if confidence < 0.80: return

        # 3. Gestión de Riesgo Institucional (Cálculo de Tamaño y SL)
        # CLI: Implementar cálculo de tamaño basado en Volatility Targeting (usando ATR) 
        # y Stop Loss Estructural (Ej. debajo del nivel Fibonacci o VWAP más cercano).
        # risk_params = self.calculate_institutional_risk(analysis) 

        # 4. Ejecución vía API (Push Model - /force_entry)
        payload = {
            "pair": "SCP/USDT",
            # Tamaño Dinámico
            "stake_amount": risk_params['calculated_stake_amount'],
            # SL Inteligente (Precio absoluto dinámico)
            "stoploss_abs": risk_params['absolute_stop_loss_price']
        }
        
        # self.freqtrade_api.call("/force_entry", payload)
        
        # 5. Broadcast Ejecución (Para visualización en el gráfico Lightweight Charts)
        # self.broadcaster.broadcast('BOT_EXECUTION', trade_details)
```
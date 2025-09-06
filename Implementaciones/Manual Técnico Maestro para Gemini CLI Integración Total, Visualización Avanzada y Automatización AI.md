This is the master plan for the convergence of Helios AI\! You are requesting the integration of all the advanced architectures we have designed—the Multi-Agent System (MAS), the RAG engine (Copilot), the execution engine (Freqtrade), the institutional analysis (Quant/HFT), and the advanced visualization—into a cohesive, autonomous, and visually professional platform.

This comprehensive technical manual integrates and expands upon the previous instructions, providing Gemini CLI with the definitive guide to implement Helios AI v4.0.

### Enhanced Features Incorporated

1.  **Neumorphism (3D Soft UI):** A modern CSS style adapted to the ScPrime dark theme for a professional 3D appearance without changing the structural code.
2.  **Professional Bot Terminal (Xterm.js + Docker Streaming):** Implementation of `Xterm.js` (the technology used by VS Code) connected directly to the Freqtrade Docker container logs for professional real-time monitoring.
3.  **NLP-to-Action (Conversational Configuration):** Equipping the Copilot Helios AI with "Tools" (using LangChain Tool Calling), enabling it to execute configurations via natural language commands.

-----

### Manual Técnico Maestro para Gemini CLI: Integración Total, Visualización Avanzada y Automatización AI

#### 1\. UI/UX Enhancement: Estilo Profesional 3D (Neomorfismo)

**Objetivo:** Apply a modern, clean, and "3D" visual style using CSS without modifying the existing HTML structure.

**Instrucciones para Gemini CLI:**

  * **Implementación:** Update the global CSS file (`styles.css` or equivalent).

<!-- end list -->

```css
/* Concepto CSS Global: styles.css */

/* Configuración Base (Tema Oscuro ScPrime) */
:root {
    --bg-color: #121212; /* Fondo principal */
    --surface-color: #1E1E1E; /* Color de tarjetas/paneles/botones */
    /* Sombras Neumórficas para Tema Oscuro */
    --shadow-dark: #0a0a0a; /* Sombra más oscura (Profundidad) */
    --shadow-light: #2a2a2a; /* Sombra más clara (Reflejo/Luz) */
    --primary-color: #00ff84; /* Verde ScPrime */
    --text-color: #E0E0E0;
}

body {
    background-color: var(--bg-color);
    color: var(--text-color);
}

/* Estilo Neumorphism para Tarjetas y Paneles */
.card, .panel, .sidebar, .grid-item {
    background-color: var(--surface-color);
    border-radius: 15px;
    /* La magia del Neumorphism: sombra inferior derecha (oscura) y sombra superior izquierda (clara) */
    box-shadow: 8px 8px 16px var(--shadow-dark), 
               -8px -8px 16px var(--shadow-light);
    border: 1px solid var(--shadow-dark);
    padding: 15px;
}

/* Estilo Neumorphism para Botones y Pestañas */
button, .tab-button {
    background-color: var(--surface-color);
    color: var(--text-color);
    border: none;
    padding: 10px 20px;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 5px 5px 10px var(--shadow-dark), 
               -5px -5px 10px var(--shadow-light);
}

/* Efecto al pasar el ratón (Hover) */
button:hover, .tab-button:hover {
    box-shadow: 3px 3px 6px var(--shadow-dark), 
               -3px -3px 6px var(--shadow-light);
}

/* Efecto de "Presionado" o Activo */
button:active, .tab-button.active {
    /* Efecto de hundido (Inset shadow) */
    box-shadow: inset 3px 3px 6px var(--shadow-dark), 
                inset -3px -3px 6px var(--shadow-light);
    color: var(--primary-color); /* Resaltar texto activo */
}
```

#### 2\. Módulo: Analysis Hub (Nueva Pestaña en Sidebar)

**Objetivo:** Create a new dedicated tab centralizing all visual market analysis tools.

**Instrucciones para Gemini CLI:**

1.  **Actualizar Sidebar HTML:** Add the new tab (e.g., `Analysis Hub`).
2.  **Estructura de la Pestaña:** Organize widgets using CSS Grid.
3.  **Integración:** Move existing components (Lightweight Charts, Plotly L2 Heatmap) into this tab.

<!-- end list -->

```html
<div id="analytics-hub" class="tab-content panel">
    <h3>Helios AI - Analysis Hub</h3>
    <div class="analytics-grid">
        
        <div id="analytics_main_chart_container" class="grid-item">
             </div>

        <div id="analytics_l2_heatmap_container" class="grid-item">
             </div>

        <div id="analytics_market_overview" class="grid-item">
            <div class="tradingview-widget-container">
              <div class="tradingview-widget-container__widget"></div>
              <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js" async>
              {
              "colorTheme": "dark", "locale": "es", "isTransparent": true,
              "tabs": [
                {
                  "title": "Crypto Focus",
                  "symbols": [
                    {"s": "COINEX:SCPUSDT", "d": "ScPrime"},
                    {"s": "BINANCE:BTCUSDT"},
                    {"s": "BINANCE:FILUSDT", "d": "Filecoin"}
                  ]
                }
              ]
             }
              </script>
            </div>
        </div>
        
        <div id="analytics_liquidation_map" class="grid-item">
             <h3>Mapa de Liquidaciones (CoinGlass)</h3>
             <iframe 
                src="https://www.coinglass.com/es/LiquidationHeatmap" 
                width="100%" height="400px" 
                frameborder="0" style="border-radius: 8px;">
            </iframe>
         </div>
    </div>
</div>
```

```css
/* Concepto CSS: AnalyticsHub.css */
.analytics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); /* Diseño responsive */
    gap: 20px;
}
```

  * **CLI:** Ensure that `Lightweight Charts` and `Plotly Heatmap L2` implementations are initialized within their respective containers (`analytics_main_chart_container`, `analytics_l2_heatmap_container`) when this tab is active.

#### 3\. Módulo: Terminal Profesional del Bot (Pestaña Trading)

**Objetivo:** Replace the current "terminal" placeholder with a real-time log view using `xterm.js`, connected directly to the Freqtrade Docker container.

**Instrucciones para Gemini CLI:**

##### 3.1. Backend (Python): Servicio de Streaming de Logs Docker

  * **Tecnología:** `docker-py`. This is the most robust method.

<!-- end list -->

```python
# Concepto Backend: BotLogStreamer.py
import docker
import asyncio
import logging

# CLI: Instalar dependencia: pip install docker

class BotLogStreamer:
    def __init__(self, container_name="freqtrade_container_name"):
        # CLI: Ensure 'container_name' matches the actual Freqtrade container name.
        self.client = docker.from_env()
        self.container_name = container_name

    async def stream_logs_to_websocket(self, websocket):
        """Adjunta a los logs del contenedor Docker y los envía al WebSocket del frontend."""
        try:
            container = self.client.containers.get(self.container_name)
            # follow=True mantiene la conexión abierta, tail=100 muestra las últimas 100 líneas.
            log_stream = container.logs(stream=True, follow=True, tail=100) 

            # Bucle asíncrono para leer el stream sin bloquear
            loop = asyncio.get_event_loop()
            while True:
                # CRUCIAL: Usar run_in_executor ya que docker-py es síncrono.
                log_line = await loop.run_in_executor(None, next, log_stream)
                if not log_line: break
                # Enviar al frontend
                await websocket.send_text(log_line.decode('utf-8'))

        except docker.errors.NotFound:
            logging.error(f"Container {self.container_name} not found.")
            # Enviar mensaje de error con color rojo ANSI (\x1b[31m)
            await websocket.send_text(f"\x1b[31mERROR: Bot container '{self.container_name}' not running.\x1b[0m")

# CLI: Integrar este servicio en el servidor web del backend (Ej. FastAPI/Flask WebSocket endpoint /api/v1/bot/logs/stream).
```

##### 3.2. Frontend (JS): Implementación de Xterm.js

```bash
# Comandos para CLI
npm install xterm xterm-addon-fit
```

```javascript
// Concepto Frontend: BotTerminal.js
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css'; // Importar CSS

let botTerminal = null;

function initBotTerminal() {
    // CLI: Usar el ID del contenedor correcto en la Pestaña Trading.
    const terminalContainer = document.getElementById('professional-bot-terminal-container');
    if (!terminalContainer || botTerminal) return;

    botTerminal = new Terminal({
        cursorBlink: true,
        theme: {
            background: '#0a0a0a',
            foreground: '#ffffff',
            // Definir colores ANSI para logs profesionales (Freqtrade los usa)
            green: '#00ff84', // ScPrime Green
            red: '#ff4976',
            yellow: '#ffcc00'
        }
    });

    // Addon para ajustar el tamaño automáticamente
    const fitAddon = new FitAddon();
    botTerminal.loadAddon(fitAddon);
    botTerminal.open(terminalContainer);
    fitAddon.fit(); // Ajustar al tamaño del contenedor

    connectToLogStream();
}

function connectToLogStream() {
    // CLI: Usar la URL correcta del endpoint WebSocket del backend.
    const ws = new WebSocket('ws://localhost:8080/api/v1/bot/logs/stream');

    ws.onopen = () => {
        // Usar códigos de color ANSI para el mensaje de bienvenida
        botTerminal.writeln('[\x1b[32mHelios AI\x1b[0m] Terminal connected. Streaming Freqtrade logs...');
    };

    ws.onmessage = (event) => {
        // Escribir datos directamente. Xterm.js maneja colores ANSI y saltos de línea.
        botTerminal.write(event.data);
    };
    
    ws.onclose = () => {
        botTerminal.writeln('\n[\x1b[31mHelios AI\x1b[0m] Connection closed.');
    };
}
// CLI: Llamar a initBotTerminal() cuando la pestaña Trading se active.
```

#### 4\. Módulo: Automatización Impulsada por IA (Copiloto Tool Calling)

**Objetivo:** Enable the RAG Assistant (Copilot Helios) to execute complex system commands (configure bot, manage node) via natural language using LangChain Tools (Function Calling).

**Instrucciones para Gemini CLI:**

  * **Implementación:** Define "Tools" that the LLM can invoke and connect them to the MAS Agents (Quant, DevOps).

<!-- end list -->

```python
# Concepto Backend: HeliosAssistantTools.py
from langchain.tools import tool
import logging

# CLI: Esta clase debe instanciarse con acceso al Core MAS (HeliosCore).
class HeliosAssistantTools:
    def __init__(self, core):
        self.core = core

    @tool
    def configure_trading_bot(self, strategy_profile: str, risk_level: str) -> str:
        """
        Configura el bot de trading (Freqtrade). 
        strategy_profile: 'HFT_ORDERFLOW', 'MEDIUM_SWING', 'LOW_RISK_DCA'.
        risk_level: 'LOW', 'MEDIUM', 'HIGH'.
        """
        logging.info(f"[AI-Tool] Copilot requested bot configuration: {strategy_profile}, Risk: {risk_level}")
        
        # Llama al Agente Quant para generar y aplicar la configuración real.
        # CLI: Implementar la función 'deploy_configuration' en QuantAnalystAgent.py
        success = self.core.agent_quant.deploy_configuration(strategy_profile, risk_level)
        
        if success:
            return f"Bot configurado exitosamente con perfil {strategy_profile} y riesgo {risk_level}."
        else:
            return "Fallo al configurar el bot. Revisar logs del sistema."

    @tool
    def optimize_scprime_node(self, goal: str) -> str:
        """
        Optimiza la configuración del nodo ScPrime. 
        goal: 'MAX_PROFIT', 'FAST_FILL', 'INCENTIVE_COMPLIANT'.
        """
        logging.info(f"[AI-Tool] Copilot requested node optimization: {goal}")
        # Llama al Agente DevOps.
        # CLI: Implementar la función 'optimize_configuration' en DevOpsEngineerAgent.py
        result = self.core.agent_devops.optimize_configuration(goal)
        return f"Nodo optimizado para {goal}. Configuración aplicada: {result}."

# Concepto Backend: HeliosAssistant.py (Actualización)
# CLI: Importar HeliosAssistantTools y las clases necesarias de LangChain (Agents).
# from langchain.agents import AgentExecutor, create_openai_tools_agent (o equivalente para Gemini Pro)

class HeliosAssistant:
    def __init__(self, core, db_path='./helios_vector_db'):
        # ... (Inicialización previa de VectorDB y LLM) ...
        
        # 1. Inicializar Herramientas
        self.tool_instance = HeliosAssistantTools(core)
        self.tools = [
            self.tool_instance.configure_trading_bot,
            self.tool_instance.optimize_scprime_node
        ]
        
        # 2. Configurar el Agente Ejecutor
        # CLI: El LLM (Ej. GPT-4o, Gemini Pro) debe soportar Function Calling.
        # CLI: Crear el agente (reemplaza la cadena QA simple). El agente decide si usar RAG o invocar una herramienta.
        
        # agent = create_openai_tools_agent(self.llm, self.tools, prompt)
        # self.agent_executor = AgentExecutor(agent=agent, tools=self.tools, verbose=True, handle_parsing_errors=True)

    def ask(self, query: str):
        # Reemplazar la llamada simple 'qa_chain.run' con el 'agent_executor.invoke'.
        # response = self.agent_executor.invoke({"input": query})
        # return response['output']
        pass # Placeholder
```

#### 5\. Módulo: Visualización Unificada y Registro Histórico

**Objetivo:** Ensure all AI analysis and Bot actions are visualized on the main chart (`Analytics Hub`) and logged in the DB.

**Instrucciones para Gemini CLI:**

##### 5.1. Logging Histórico (DB Schema)

  * **Implementación:** Ensure `HeliosMemory` (SQLite) links AI decisions with executed trades.

<!-- end list -->

```sql
-- Concepto SQLite Schema (Actualización en HeliosMemory)

-- Registro de Decisiones de la IA (Análisis Institucional)
CREATE TABLE IF NOT EXISTS ai_decision_log (
    id INTEGER PRIMARY KEY,
    timestamp TEXT,
    agent TEXT, -- 'Quant', 'DevOps', 'Copiloto'
    decision_type TEXT, -- Ej. 'ORDERFLOW_ABSORPTION', 'BOT_RECONFIG', 'PRICE_OPTIMIZATION'
    rationale TEXT NULL, -- Explicación de la IA para la decisión
    context_json TEXT -- JSON con datos relevantes
);

-- Asegurar que la tabla de Trades del Bot pueda vincularse a la decisión AI
-- CLI: Si la tabla bot_trade_history ya existe, usar ALTER TABLE.
-- ALTER TABLE bot_trade_history ADD COLUMN ai_decision_id INTEGER NULL REFERENCES ai_decision_log(id);
```

##### 5.2. Conexión Análisis-Visualización (Backend a Frontend)

  * **Implementación:** Ensure Agents (Quant/DevOps) and the Execution Module broadcast events via WebSocket when actions occur.

<!-- end list -->

```python
# Concepto Backend: EventBroadcaster.py (Centralizado)

class EventBroadcaster:
    # ... (Gestión de conexiones WebSocket) ...

    def broadcast_ai_decision(self, analysis):
        """Envía señales de análisis al frontend para visualización."""
        visualization_signal = {
            "type": "AI_ANALYSIS_SIGNAL",
            "data": {
                "time": analysis['timestamp'],
                "type": analysis['type'], # Ej. 'LIQUIDITY_WALL', 'ABSORPTION'
                "price": analysis.get('price_level'),
                "rationale": analysis.get('rationale')
            }
        }
        # self.broadcast(visualization_signal)

    def broadcast_bot_execution(self, order_details):
        """Envía detalles de la ejecución del trade al frontend."""
        trade_signal = {
             "type": "BOT_EXECUTION",
             "data": order_details # side, price, timestamp
        }
        # self.broadcast(trade_signal)

# CLI: Los Agentes (QuantAgent, ExecutionModule) deben llamar a este Broadcaster después de registrar la acción en la DB.
```

  * **CLI (Frontend):** Ensure `LWEventVisualizer.js` (Ref: Lightweight Charts Manual) is subscribed to these WebSocket messages (`AI_ANALYSIS_SIGNAL`, `BOT_EXECUTION`) and updates the main chart in the `Analytics Hub` using `visualizeHeliosAnalysis()` and `visualizeBotExecution()`.
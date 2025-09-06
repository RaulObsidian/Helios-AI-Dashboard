import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getWalletAndHostState, getHostStatus } from './spcService.js';
import { SmartSelector } from './SmartSelector.js';
import { SecurityManager } from './SecurityManager.js';
import { HeliosMemory } from './HeliosMemory.js';
import { AutonomousDirector } from './AutonomousDirector.js';
import { HeliosAssistant } from './HeliosAssistant.js';

// --- Inicialización de Servicios ---
dotenv.config();

const app = express();
const port = 3001;
let apiPassword = '';

// Servicios Principales
const heliosMemory = new HeliosMemory();
let securityManager; // Se inicializa al conectar
const selector = new SmartSelector(heliosMemory, null); // Inicializa sin securityManager
const director = new AutonomousDirector(heliosMemory, selector);
const assistant = new HeliosAssistant();
assistant.initialize(); // Carga la DB de conocimiento (sin API Key al inicio)

// --- Middleware ---
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// --- Rutas de la API ---

app.post('/api/connect', async (req, res) => { // Convertido a async
    const { password } = req.body;
    if (typeof password === 'string') {
        apiPassword = password;
        securityManager = new SecurityManager(password || 'default-password');
        
        // Inyecta el securityManager en los servicios que lo necesitan
        selector.securityManager = securityManager;
        await selector._initializeApiProviders(); // Ahora inicializa los proveedores con clave

        // Re-inicializar el asistente con la clave guardada, si existe
        const llmKeyRecord = await heliosMemory.getApiKey('LLM');
        if (llmKeyRecord && llmKeyRecord.api_key) {
            const decryptedKey = securityManager.decryptData(llmKeyRecord.api_key);
            await assistant.initialize(decryptedKey);
            console.log("Assistant re-initialized with stored LLM key.");
        }

        console.log("API password set and SecurityManager initialized.");
        res.json({ success: true, message: 'API password set.' });
    } else {
        res.status(400).json({ success: false, error: 'Invalid password format.' });
    }
});

app.post('/api/keys', async (req, res) => {
    if (!securityManager) {
        return res.status(401).json({ error: 'Not connected. Please set API password first.' });
    }
    const { provider, apiKey, apiSecret } = req.body;
    try {
        const encryptedKey = securityManager.encryptData(apiKey);
        const encryptedSecret = apiSecret ? securityManager.encryptData(apiSecret) : null;
        await heliosMemory.saveApiKey(provider, encryptedKey, encryptedSecret);
        
        // Re-inicializar proveedores para que la nueva clave esté disponible
        await selector._initializeApiProviders();

        // Si la clave guardada es para el LLM, re-inicializar el asistente
        if (provider === 'LLM') {
            await assistant.initialize(apiKey);
        }

        res.json({ success: true, message: `${provider} API key saved.` });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save API key.', details: error.message });
    }
});

app.get('/api/wallet-status', async (req, res) => {
    try {
        const walletState = await getWalletAndHostState(apiPassword);
        res.json(walletState);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to retrieve wallet status.',
            details: error.message
        });
    }
});

app.get('/api/host-status', async (req, res) => {
    try {
        const hostStatus = await getHostStatus(apiPassword);
        res.json(hostStatus);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to retrieve host status.',
            details: error.message
        });
    }
});

app.get('/api/market-data', async (req, res) => {
    const provider = req.query.provider || 'Automatic';
    try {
        const marketData = await selector.getMarketData(provider);
        res.json(marketData);
    } catch (error) {
        res.status(500).json({ error: `Failed to retrieve market data for selection ${provider}.`, details: error.message });
    }
});

app.post('/api/assistant/ask', async (req, res) => {
    if (!assistant) {
        return res.status(503).json({ error: 'Helios Assistant is not yet initialized.' });
    }
    const { query, context } = req.body;
    try {
        const response = await assistant.ask(query, context);
        res.json({ response });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get response from assistant.', details: error.message });
    }
});

    app.get('/api/ai/recommendations', (req, res) => {
    if (!director) {
        return res.json({ alerts: [] });
    }
    const alerts = director.getAlerts();
    res.json({ alerts });
});

app.get('/api/node-metrics', async (req, res) => {
    try {
        // Necesitamos importar getNodeMetrics
        const { getNodeMetrics } = await import('./spcService.js');
        const metrics = await getNodeMetrics(apiPassword);
        res.json(metrics);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to retrieve node metrics.',
            details: error.message
        });
    }
});

// --- Rutas de Trading Bot ---

app.get('/api/trading/bot/status', (req, res) => {
    try {
        const status = director.getBotStatus();
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get bot status.', details: error.message });
    }
});

app.post('/api/trading/bot/configure', (req, res) => {
    try {
        const config = req.body;
        const status = director.configureBot(config);
        res.json(status);
    } catch (error) {
        res.status(400).json({ error: 'Failed to configure bot.', details: error.message });
    }
});

app.post('/api/trading/bot/start', async (req, res) => {
    try {
        const status = await director.startBot();
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: 'Failed to start bot.', details: error.message });
    }
});

app.get('/api/trading/bot/latest-thesis', async (req, res) => {
    try {
        const thesis = await heliosMemory.getLatestTradingThesis();
        if (thesis) {
            res.json(thesis);
        } else {
            res.status(404).json({ error: 'No trading thesis has been generated yet.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to get latest thesis.', details: error.message });
    }
});

app.post('/api/trading/bot/stop', (req, res) => {
    try {
        const status = director.stopBot();
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: 'Failed to stop bot.', details: error.message });
    }
});

app.get('/api/trading/bot/propose-config', async (req, res) => {
    try {
        const config = await director.proposeGridConfig();
        res.json(config);
    } catch (error) {
        res.status(500).json({ error: 'Failed to propose bot configuration.', details: error.message });
    }
});

// --- Rutas del Centro de Análisis ---

app.get('/api/analysis/history', async (req, res) => {
    try {
        // TODO: Reemplazar con datos reales de la base de datos o de un proveedor.
        // Por ahora, generamos datos de prueba realistas.
        let ohlcv = [];
        let lastClose = 0.045;
        for (let i = 0; i < 200; i++) {
            const open = lastClose;
            const close = open + (Math.random() - 0.5) * 0.005;
            const high = Math.max(open, close) + Math.random() * 0.002;
            const low = Math.min(open, close) - Math.random() * 0.002;
            ohlcv.push({
                time: Date.now() / 1000 - (200 - i) * 3600, // Velas de 1 hora
                open,
                high,
                low,
                close,
                volume: Math.random() * 100000,
            });
            lastClose = close;
        }
        res.json(ohlcv);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch chart history.', details: error.message });
    }
});

app.get('/api/analysis/bot-state', (req, res) => {
    try {
        const status = director.getBotStatus();
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get bot state.', details: error.message });
    }
});

app.post('/api/analysis/execute-command', async (req, res) => {
    const { command } = req.body;
    if (command === 'find_support_resistance') {
        try {
            // Obtenemos los mismos datos de prueba para el análisis
            const historyResponse = await fetch('http://localhost:3001/api/analysis/history');
            const historyData = await historyResponse.json();
            const result = director.analysisService.findSupportResistance(historyData);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: 'Failed to execute analysis command.', details: error.message });
        }
    } else {
        res.status(400).json({ error: `Unknown analysis command: ${command}` });
    }
});


// --- Inicio del Servidor ---
app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
    console.log("Asegúrate de que la variable SPC_CLI_PATH en el archivo 'server/.env' es correcta.");

    // Iniciar el ciclo de diagnóstico del Director
    setInterval(() => {
        director.runDiagnostics();
    }, 60000);
});
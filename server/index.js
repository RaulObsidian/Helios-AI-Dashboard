// server/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getWalletAndHostState, getHostStatus } from './spcService.js';
import { SmartSelector } from './SmartSelector.js';
import { SecurityManager } from './SecurityManager.js';
import { HeliosMemory } from './HeliosMemory.js';
import { AutonomousDirector } from './AutonomousDirector.js';

const heliosMemory = new HeliosMemory();
let securityManager; // Se inicializará cuando el usuario se conecte
let selector; // Se inicializará después de securityManager
let director; // Se inicializará después de securityManager

// Cargar variables de entorno desde el archivo .env
dotenv.config();

const app = express();
const port = 3001;

// Variable para almacenar la contraseña de la API en memoria
let apiPassword = '';

// --- Middleware ---
app.use(cors({
  origin: 'http://localhost:5173'
}));
app.use(express.json());

// --- Rutas de la API ---

/**
 * Endpoint para recibir y almacenar la contraseña de la API.
 */
app.post('/api/connect', (req, res) => {
    const { password } = req.body;
    if (typeof password === 'string') {
        apiPassword = password;
        // Inicializa el SecurityManager con la contraseña maestra del usuario
        securityManager = new SecurityManager(password || 'default-password');
        selector = new SmartSelector(heliosMemory, securityManager); // Ahora inicializamos el selector aquí
        director = new AutonomousDirector(heliosMemory, selector);
        console.log("API password set and all services initialized.");
        res.json({ success: true, message: 'API password set.' });
    } else {
        res.status(400).json({ success: false, error: 'Invalid password format.' });
    }
});

/**
 * Endpoint para guardar una clave de API cifrada.
 */
app.post('/api/keys', async (req, res) => {
    if (!securityManager) {
        return res.status(401).json({ error: 'Not connected. Please set API password first.' });
    }
    const { provider, apiKey, apiSecret } = req.body;
    try {
        const encryptedKey = securityManager.encryptData(apiKey);
        const encryptedSecret = apiSecret ? securityManager.encryptData(apiSecret) : null;
        await heliosMemory.saveApiKey(provider, encryptedKey, encryptedSecret);
        res.json({ success: true, message: `${provider} API key saved.` });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save API key.', details: error.message });
    }
});

/**
 * Endpoint para obtener el estado financiero de la cartera y el nodo.
 * Combina datos de 'wallet' y 'host -v'.
 */
app.get('/api/wallet-status', async (req, res) => {
    try {
        const walletState = await getWalletAndHostState(apiPassword);
        res.json(walletState);
    } catch (error) {
        // Enviar una respuesta de error estandarizada
        res.status(500).json({
            error: 'Failed to retrieve wallet status.',
            details: error.message
        });
    }
});

/**
 * Endpoint para obtener el estado general del host, como la altura del bloque y los peers.
 */
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

/**
 * Endpoint para obtener datos de mercado de CoinGecko.
 * Actúa como un proxy para evitar problemas de CORS en el frontend.
 */
app.get('/api/market-data', async (req, res) => {
    const provider = req.query.provider || 'Automatic'; // Usa Automático por defecto
    try {
        const marketData = await selector.getMarketData(provider);
        res.json(marketData);
    } catch (error) {
        res.status(500).json({
            error: `Failed to retrieve market data for selection ${provider}.`,
            details: error.message
        });
    }
});

/**
 * Endpoint para obtener las alertas y recomendaciones del Director de IA.
 */
app.get('/api/ai/recommendations', (req, res) => {
    if (!director) {
        return res.json({ alerts: [] }); // Si el director no está listo, devuelve un array vacío.
    }
    const alerts = director.getAlerts();
    res.json({ alerts });
});


// --- Inicio del Servidor ---
app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
    console.log("Asegúrate de que la variable SPC_CLI_PATH en el archivo 'server/.env' es correcta.");

    // Iniciar el ciclo de diagnóstico del Director
    setInterval(() => {
        if (director) {
            director.runDiagnostics();
        }
    }, 60000); // Ejecutar diagnósticos cada 60 segundos
});

// server/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getWalletAndHostState, getHostStatus } from './spcService.js';
import { SmartSelector } from './SmartSelector.js';

const selector = new SmartSelector();

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
        console.log("API password set.");
        // Opcional: Realizar una prueba de conexión aquí para validar la contraseña
        res.json({ success: true, message: 'API password set.' });
    } else {
        res.status(400).json({ success: false, error: 'Invalid password format.' });
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


// --- Inicio del Servidor ---
app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
    console.log("Asegúrate de que la variable SPC_CLI_PATH en el archivo 'server/.env' es correcta.");
});

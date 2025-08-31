// server/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getWalletAndHostState, getHostStatus } from './spcService.js';

// Cargar variables de entorno desde el archivo .env
dotenv.config();

const app = express();
const port = 3001;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Rutas de la API ---

/**
 * Endpoint para obtener el estado financiero de la cartera y el nodo.
 * Combina datos de 'wallet' y 'host -v'.
 */
app.get('/api/wallet-status', async (req, res) => {
    try {
        const walletState = await getWalletAndHostState();
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
        const hostStatus = await getHostStatus();
        res.json(hostStatus);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to retrieve host status.',
            details: error.message
        });
    }
});


// --- Inicio del Servidor ---
app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
    console.log("Asegúrate de que la variable SPC_CLI_PATH en el archivo 'server/.env' es correcta.");
});

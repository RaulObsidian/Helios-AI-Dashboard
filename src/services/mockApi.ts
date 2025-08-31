import { useAppStore } from '../store';
import { ConnectionStatus } from '../types';


// --- Motor de Simulación ---
// Este objeto mantendrá el estado "real" del backend simulado.
const simulationEngine = {
    isConnected: false,
    wallet: {
        totalBalance: 150000,
        unlockedBalance: 120000,
        lockedCollateral: 30000,
        nodeProfits: 8500,
        tradingProfits: 2500,
    },
    market: {
        priceUSD: 0.035,
    },
    node: {
        blockHeight: 184567,
    },
    timers: {
        blockTimer: null as number | null,
        priceTimer: null as number | null,
        profitTimer: null as number | null,
    }
};

// --- Funciones de la API Simulada ---

export const mockApi = {
    connect: (password: string): Promise<{ success: boolean; message: string }> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (password === 'password123') {
                    simulationEngine.isConnected = true;
                    useAppStore.setState({ nodeConnectionStatus: ConnectionStatus.CONNECTED });
                    startSimulation();
                    resolve({ success: true, message: 'Connection successful.' });
                } else {
                    useAppStore.setState({ nodeConnectionStatus: ConnectionStatus.FAILED });
                    resolve({ success: false, message: 'Invalid API password.' });
                }
            }, 1500); // Simula un retardo de red
        });
    },

    disconnect: () => {
        simulationEngine.isConnected = false;
        stopSimulation();
        useAppStore.setState({ nodeConnectionStatus: ConnectionStatus.DISCONNECTED });
    },
};

// --- Lógica de la Simulación ---

function startSimulation() {
    // 1. Simular actualización de altura de bloque
    simulationEngine.timers.blockTimer = setInterval(() => {
        simulationEngine.node.blockHeight++;
        useAppStore.setState({ blockHeight: simulationEngine.node.blockHeight });
    }, 8000); // Nuevo bloque cada 8 segundos

    // 2. Simular fluctuación de precio
    simulationEngine.timers.priceTimer = setInterval(() => {
        const change = (Math.random() - 0.5) * 0.001;
        simulationEngine.market.priceUSD += change;
        useAppStore.setState(state => ({
            marketData: state.marketData ? { ...state.marketData, priceUSD: simulationEngine.market.priceUSD } : null
        }));
    }, 2000); // El precio cambia cada 2 segundos

    // 3. Simular beneficios de nodo
    simulationEngine.timers.profitTimer = setInterval(() => {
        const nodeReward = Math.random() * 5;
        simulationEngine.wallet.nodeProfits += nodeReward;
        simulationEngine.wallet.totalBalance += nodeReward;
        simulationEngine.wallet.unlockedBalance += nodeReward;
        useAppStore.setState({ walletState: { ...simulationEngine.wallet } });
    }, 30000); // Recompensa de nodo cada 30 segundos
}

function stopSimulation() {
    if (simulationEngine.timers.blockTimer) clearInterval(simulationEngine.timers.blockTimer);
    if (simulationEngine.timers.priceTimer) clearInterval(simulationEngine.timers.priceTimer);
    if (simulationEngine.timers.profitTimer) clearInterval(simulationEngine.timers.profitTimer);
}

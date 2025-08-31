import { create } from 'zustand';
import type { AppState, AppConfig, TradingConnection, WalletState } from './types.ts';
import { SetupType, NodeManagementStrategy, TradingStrategy, DataProvider, ChartType, ConnectionStatus } from './types.ts';

// --- Estado Inicial Simulado ---
const initialConfig: AppConfig = {
    hardwareProfile: SetupType.XA_MINER,
    tradingEnabled: true,
    tradingStrategy: TradingStrategy.MEDIUM_RISK_SWING,
    nodeManagementStrategy: NodeManagementStrategy.BALANCED,
    language: 'en',
    currency: 'USD',
    connectedWallets: [],
    priceProvider: DataProvider.COINGECKO,
    nodeAddress: 'localhost:4280',
    apiPassword: '',
    tradingConnections: [],
    allocatedTradingBalance: 0,
    supervisorLiteEnabled: false,
    chartConfig: {
        timeframe: '60',
        chartType: ChartType.CANDLE,
        indicators: [],
        useEmbeddedChart: false,
        appearance: {
            background: '#111827',
            grid: '#374151',
            upCandle: '#34D399',
            downCandle: '#F87171',
            wick: '#A6ADBB',
        }
    }
};

const initialState: Omit<AppState, 'config'> = {
    marketData: {
        provider: DataProvider.COINGECKO,
        priceUSD: 0.035,
        marketCapUSD: 3500000,
        volume24hUSD: 150000,
        tickVolume: 12345,
        buySellRatio: 0.58,
    },
    nodeMetrics: {
        utilization: 85.5,
        priceScpTb: 1500,
        suggestedPriceScpTb: 1450,
        incentiveStatus: 'OK',
        incentiveLimitScpTb: 2000,
    },
    tradingLog: [
        { id: 1, timestamp: new Date().toISOString(), strategy: TradingStrategy.LOW_RISK_DCA, action: 'tradinglog.action.buy', amountSCP: 500, priceUSD: 0.034, status: 'Completed' },
        { id: 2, timestamp: new Date().toISOString(), strategy: TradingStrategy.LOW_RISK_DCA, action: 'tradinglog.action.sell', amountSCP: 250, priceUSD: 0.036, status: 'Completed' },
    ],
    eventLog: [
        'AI Agent Initialized: Monitoring node and market data.',
        'Node price check: Current price is competitive.',
        'Market analysis: Volume spike detected.',
    ],
    errorLog: [],
    priceHistory: [],
    ohlcData: {},
    nodeConnectionStatus: ConnectionStatus.DISCONNECTED,
    walletState: {
        totalBalance: 150000,
        unlockedBalance: 120000,
        lockedCollateral: 30000,
        nodeProfits: 8500,
        tradingProfits: 2500,
    },
    publicIP: '88.12.34.56',
    blockHeight: 184567,
};

// --- Definición del Store ---
interface AppStateWithActions extends AppState {
    config: AppConfig;
    fetchHostState: () => Promise<void>;
    fetchWalletState: () => Promise<void>; // Nueva acción
    setLanguage: (lang: 'en' | 'es') => void;
    setNodeConnectionStatus: (status: ConnectionStatus) => void;
    updateConfig: (newConfig: Partial<AppConfig>) => void;
    addTradingConnection: (connection: TradingConnection) => void;
    removeTradingConnection: (id: string) => void;
}

export const useAppStore = create<AppStateWithActions>((set) => ({
    ...initialState,
    config: initialConfig,
    fetchHostState: async () => {
        try {
            const response = await fetch('http://localhost:3001/api/host-status');
            if (!response.ok) {
                throw new Error('Network response was not ok for host status');
            }
            const data = await response.json();
            console.log("Datos recibidos de /api/host-status:", data); // <-- AÑADIMOS ESTO
            set({ 
                blockHeight: data.blockHeight,
                nodeConnectionStatus: ConnectionStatus.CONNECTED 
            });
        } catch (error) {
            console.error("Failed to fetch host state:", error);
            set({ nodeConnectionStatus: ConnectionStatus.FAILED });
        }
    },
    fetchWalletState: async () => {
        try {
            const response = await fetch('http://localhost:3001/api/wallet-status');
            if (!response.ok) {
                throw new Error('Network response was not ok for wallet status');
            }
            const data: WalletState = await response.json();
            set({ walletState: data });
        } catch (error) {
            console.error("Failed to fetch wallet state:", error);
        }
    },
    setLanguage: (lang) => set(state => ({ config: { ...state.config, language: lang } })),
    setNodeConnectionStatus: (status) => set({ nodeConnectionStatus: status }),
    updateConfig: (newConfig) => set(state => ({ config: { ...state.config, ...newConfig } })),
    addTradingConnection: (connection) => set(state => ({
        config: { ...state.config, tradingConnections: [...state.config.tradingConnections, connection] }
    })),
    removeTradingConnection: (id) => set(state => ({
        config: { ...state.config, tradingConnections: state.config.tradingConnections.filter(c => c.id !== id) }
    })),
}));

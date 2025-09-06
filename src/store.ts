import { create } from 'zustand';
import type { AppState, AppConfig, TradingConnection, WalletState, MarketData, Alert, BotState } from './types.ts';
import { SetupType, NodeManagementStrategy, TradingStrategy, DataProvider, ChartType, ConnectionStatus } from './types.ts';

// --- Estado Inicial Simulado ---
const initialBotState: BotState = {
    state: 'IDLE',
    strategy: null,
    config: null,
    pnl: 0,
    openOrders: 0,
};

const initialConfig: AppConfig = {
    hardwareProfile: SetupType.XA_MINER,
    tradingEnabled: true,
    tradingStrategy: TradingStrategy.MEDIUM_RISK_SWING,
    nodeManagementStrategy: NodeManagementStrategy.BALANCED,
    language: 'en',
    currency: 'USD',
    connectedWallets: [],
    priceProvider: DataProvider.AUTO,
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

const initialState: Omit<AppState, 'config' | 'botState'> = {
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
        { id: 1, timestamp: new Date().toISOString(), strategy: TradingStrategy.LOW_RISK_DCA, action: 'tradingLog.action.buy', amountSCP: 500, priceUSD: 0.034, status: 'Completed' },
        { id: 2, timestamp: new Date().toISOString(), strategy: TradingStrategy.LOW_RISK_DCA, action: 'tradingLog.action.sell', amountSCP: 250, priceUSD: 0.036, status: 'Completed' },
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
    prevMarketData: MarketData | null;
    marketDataError: string | null;
    alerts: Alert[];
    fetchHostState: () => Promise<void>;
    fetchWalletState: () => Promise<void>;
    fetchNodeMetrics: () => Promise<void>;
    fetchMarketData: () => Promise<void>;
    fetchAlerts: () => Promise<void>;
    dismissAlert: (id: string) => void;
    setLanguage: (lang: string) => void;
    setNodeConnectionStatus: (status: ConnectionStatus) => void;
    updateConfig: (newConfig: Partial<AppConfig>) => void;
    addTradingConnection: (connection: TradingConnection) => void;
    removeTradingConnection: (id: string) => void;
    // Acciones del Bot
    fetchBotStatus: () => Promise<void>;
    configureBot: (config: object) => Promise<void>;
    startBot: () => Promise<void>;
    stopBot: () => Promise<void>;
}

export const useAppStore = create<AppStateWithActions>((set, get) => ({
    ...initialState,
    botState: initialBotState,
    alerts: [],
    prevMarketData: null,
    marketDataError: null,
    config: initialConfig,
    fetchHostState: async () => {
        try {
            const response = await fetch('http://localhost:3001/api/host-status');
            if (!response.ok) throw new Error('Network response was not ok for host status');
            const data = await response.json();
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
            if (!response.ok) throw new Error('Network response was not ok for wallet status');
            const data: WalletState = await response.json();
            set({ walletState: data });
        } catch (error) {
            console.error("Failed to fetch wallet state:", error);
        }
    },
    fetchNodeMetrics: async () => {
        try {
            const response = await fetch('http://localhost:3001/api/node-metrics');
            if (!response.ok) throw new Error('Network response was not ok for node metrics');
            const data = await response.json();
            set({ nodeMetrics: data });
        } catch (error) {
            console.error("Failed to fetch node metrics:", error);
        }
    },
    fetchMarketData: async () => {
        const { marketData, config } = get();
        const provider = config.priceProvider;
        try {
            const url = `http://localhost:3001/api/market-data?provider=${provider}`;
            const response = await fetch(url);
            if (!response.ok) {
                const errorBody = await response.json();
                throw new Error(errorBody.details || `Network response was not ok for ${provider}`);
            }
            const apiData = await response.json();
            const newMarketData: MarketData = {
                provider: apiData.provider || provider,
                priceUSD: apiData.price || 0,
                marketCapUSD: apiData.marketCap || 0,
                volume24hUSD: apiData.volume || 0,
                tickVolume: 0,
                buySellRatio: 0.5,
            };
            set({
                marketData: newMarketData,
                prevMarketData: marketData,
                marketDataError: null,
            });
        } catch (error: any) {
            const errorMessage = `Failed to fetch from ${provider}: ${error.message}`;
            console.error(errorMessage);
            set({ 
                marketDataError: errorMessage,
                // Restablecer a un estado válido en caso de error para evitar inconsistencias de tipo
                marketData: {
                    provider: provider,
                    priceUSD: 0,
                    marketCapUSD: 0,
                    volume24hUSD: 0,
                    tickVolume: 0,
                    buySellRatio: 0,
                }
            });
        }
    },
    setLanguage: (lang: string) => set(state => ({ config: { ...state.config, language: lang } })),
    setNodeConnectionStatus: (status) => set({ nodeConnectionStatus: status }),
    updateConfig: (newConfig) => set(state => ({ config: { ...state.config, ...newConfig } })),
    addTradingConnection: (connection) => set(state => ({
        config: { ...state.config, tradingConnections: [...state.config.tradingConnections, connection] }
    })),
    removeTradingConnection: (id) => set(state => ({
        config: { ...state.config, tradingConnections: state.config.tradingConnections.filter(c => c.id !== id) }
    })),
    fetchAlerts: async () => {
        try {
            const response = await fetch('http://localhost:3001/api/ai/recommendations');
            if (!response.ok) throw new Error('Failed to fetch alerts');
            const data = await response.json();
            set({ alerts: data.alerts });
        } catch (error) {
            console.error("Failed to fetch alerts:", error);
        }
    },
    dismissAlert: (id) => set(state => ({
        alerts: state.alerts.filter(alert => alert.id !== id)
    })),

    // --- Acciones del Bot ---
    fetchBotStatus: async () => {
        try {
            const response = await fetch('http://localhost:3001/api/trading/bot/status');
            if (!response.ok) throw new Error('Failed to fetch bot status');
            const data = await response.json();
            set({ botState: data });
        } catch (error) {
            console.error("Error fetching bot status:", error);
        }
    },
    configureBot: async (config) => {
        try {
            const response = await fetch('http://localhost:3001/api/trading/bot/configure', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            });
            if (!response.ok) throw new Error('Failed to configure bot');
            const data = await response.json();
            set({ botState: data });
        } catch (error) {
            console.error("Error configuring bot:", error);
        }
    },
    startBot: async () => {
        try {
            const response = await fetch('http://localhost:3001/api/trading/bot/start', { method: 'POST' });
            if (!response.ok) throw new Error('Failed to start bot');
            const data = await response.json();
            set({ botState: data });
        } catch (error) {
            console.error("Error starting bot:", error);
        }
    },
    stopBot: async () => {
        try {
            const response = await fetch('http://localhost:3001/api/trading/bot/stop', { method: 'POST' });
            if (!response.ok) throw new Error('Failed to stop bot');
            const data = await response.json();
            set({ botState: data });
        } catch (error) {
            console.error("Error stopping bot:", error);
        }
    },
}));

// --- Mock de datos para desarrollo ---
if (import.meta.env.DEV) {
    const mockAlerts: Alert[] = [
        { id: '1', type: 'info', message: 'alerts.mock.price_update', recommendation: 'Consider adjusting your storage price.', timestamp: new Date().toISOString() },
        { id: '2', type: 'warning', message: 'alerts.mock.low_balance', recommendation: 'Deposit funds to avoid service interruption.', timestamp: new Date().toISOString() },
        { id: '3', type: 'error', message: 'alerts.mock.api_fail', recommendation: 'Check API keys for CoinMarketCap.', timestamp: new Date().toISOString() },
    ];
    useAppStore.setState({ alerts: mockAlerts });
}
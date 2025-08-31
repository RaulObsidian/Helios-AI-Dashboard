// Cache-busting comment
// --- Enums ---

export enum SetupType {
    DIY = 'DIY',
    XA_MINER = 'XA_MINER',
}

export enum NodeManagementStrategy {
    MAX_PERFORMANCE = 'MAX_PERFORMANCE',
    BALANCED = 'BALANCED',
    LOW_IMPACT = 'LOW_IMPACT',
    AUTOMATIC = 'AUTOMATIC',
}

export enum DataProvider {
    AUTO = 'Automatic',
    COINGECKO = 'CoinGecko',
    COINPAPRIKA = 'CoinPaprika',
    COINMARKETCAP = 'CoinMarketCap',
    CRYPTOCOMPARE = 'CryptoCompare',
    KUCOIN = 'KuCoin',
    GATEIO = 'Gate.io',
    TRADEOGRE = 'TradeOgre',
    COINBASE = 'Coinbase',
    BINANCE = 'Binance',
    KRAKEN = 'Kraken',
}

export enum TradingStrategy {
    LOW_RISK_DCA = 'Low Risk DCA',
    MEDIUM_RISK_SWING = 'Medium Risk Swing',
    HIGH_RISK_MOMENTUM = 'High Risk Momentum',
    AUTOMATIC = 'Automatic',
}

export enum WalletType {
    SCPRIME = 'ScPrime Wallet',
    COLD = 'Cold Wallet',
    LEDGER = 'Ledger',
}

export enum ConnectionStatus {
    DISCONNECTED = 'DISCONNECTED',
    CONNECTING = 'CONNECTING',
    CONNECTED = 'CONNECTED',
    FAILED = 'FAILED',
}

export enum ChartType {
    LINE = 'Line',
    CANDLE = 'Candle',
}

// --- Interfaces ---

export interface ConnectedWallet {
    id: string;
    type: WalletType;
    address: string;
    balance: number;
}

export interface MarketData {
    provider: DataProvider;
    priceUSD: number;
    marketCapUSD: number;
    volume24hUSD: number;
    tickVolume: number;
    buySellRatio: number;
}

export interface TradeLog {
    id: number;
    timestamp: string;
    strategy: TradingStrategy;
    action: 'tradinglog.action.buy' | 'tradinglog.action.sell';
    amountSCP: number;
    priceUSD: number;
    status: string;
}

export interface NodeMetrics {
    utilization: number;
    priceScpTb: number;
    suggestedPriceScpTb: number;
    incentiveStatus: 'OK' | 'EXCEEDED';
    incentiveLimitScpTb: number;
}

export interface ChartIndicator {
    [key: string]: unknown; 
}

export interface IndicatorInstance {
    id: string;
    type: string;
    settings: { [key: string]: unknown };
}

export interface ChartAppearance {
    background: string;
    grid: string;
    upCandle: string;
    downCandle: string;
    wick: string;
}

export interface ChartConfig {
    timeframe: string;
    chartType: ChartType;
    indicators: IndicatorInstance[];
    useEmbeddedChart: boolean;
    appearance: ChartAppearance;
}

export interface TradingConnection {
    id: string;
    exchange: DataProvider;
    apiKey: string;
    apiSecret: string;
    status: ConnectionStatus;
}

export interface AppConfig {
    hardwareProfile: SetupType;
    tradingEnabled: boolean;
    tradingStrategy: TradingStrategy;
    nodeManagementStrategy: NodeManagementStrategy;
    language: string;
    currency: string;
    connectedWallets: ConnectedWallet[];
    priceProvider: DataProvider;
    nodeAddress: string;
    apiPassword: string;
    tradingConnections: TradingConnection[];
    allocatedTradingBalance: number;
    supervisorLiteEnabled: boolean;
    chartConfig: ChartConfig;
}

export interface PriceHistoryPoint {
    time: number;
    price: number;
    volume: number;
    buySellRatio: number;
}

export interface OHLCData {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface AppError {
    id: number;
    timestamp: string;
    message: string;
    severity: 'Warning' | 'Error' | 'Critical';
}

export interface WalletState {
    totalBalance: number;
    nodeProfits: number;
    tradingProfits: number;
    lockedCollateral: number;
    unlockedBalance: number;
}

export interface AppState {
    marketData: MarketData | null;
    nodeMetrics: NodeMetrics;
    tradingLog: TradeLog[];
    eventLog: string[];
    errorLog: AppError[];
    priceHistory: PriceHistoryPoint[];
    ohlcData: Record<string, OHLCData[]>;
    nodeConnectionStatus: ConnectionStatus;
    walletState: WalletState;
    publicIP: string;
    blockHeight: number | null;
}

export interface ToastNotification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

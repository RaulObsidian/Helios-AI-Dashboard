// server/AutonomousDirector.js
import { TradingBot } from './TradingBot.js';
import { ExchangeConnector } from './ExchangeConnector.js';
import { GridStrategy } from './strategies/GridStrategy.js';

export class AutonomousDirector {
    constructor(heliosMemory, smartSelector) {
        this.memory = heliosMemory;
        this.selector = smartSelector;
        this.alerts = [];

        // Inicializar los componentes de trading
        this.exchangeConnector = new ExchangeConnector(smartSelector);
        this.bot = new TradingBot(this.exchangeConnector);

        // Escuchar eventos del bot para logging o alertas
        this.bot.on('error', (errorMsg) => {
            this._generateAlert('BOT_ERROR', `El bot de trading se detuvo con un error: ${errorMsg}`, 'TradingBot');
            this.memory.logEvent('ERROR', `Bot error: ${errorMsg}`, 'TradingBot');
        });
    }

    /**
     * Propone una configuración de Grid Trading basada en datos de mercado recientes.
     * @returns {Promise<object>} - La configuración de estrategia propuesta.
     */
    async proposeGridConfig() {
        console.log('[Director] Proponiendo configuración de Grid...');
        try {
            const marketData = await this.selector.getMarketData('Automatic');
            const currentPrice = marketData.price;
            const volatility = 0.15; // Asumimos una volatilidad del 15%
            const lowerPrice = currentPrice * (1 - volatility);
            const upperPrice = currentPrice * (1 + volatility);

            return {
                strategy: 'GridStrategy',
                lowerPrice: parseFloat(lowerPrice.toFixed(4)),
                upperPrice: parseFloat(upperPrice.toFixed(4)),
                gridSize: 20,
                investment: 1000,
            };
        } catch (error) {
            console.error('[Director] No se pudo proponer una configuración:', error);
            throw new Error('No se pudieron obtener datos de mercado para proponer una configuración.');
        }
    }

    /**
     * Configura e inicializa el bot de trading con una estrategia.
     * @param {object} config - La configuración para la estrategia.
     */
    configureBot(config) {
        const strategy = new GridStrategy(config);
        this.bot.configure(strategy);
        return this.getBotStatus();
    }

    async startBot() {
        await this.bot.start();
        return this.getBotStatus();
    }

    stopBot() {
        this.bot.stop();
        return this.getBotStatus();
    }

    getBotStatus() {
        return {
            state: this.bot.state,
            strategy: this.bot.strategy ? this.bot.strategy.name : null,
            config: this.bot.strategy ? this.bot.strategy.config : null,
            pnl: this.bot.pnl,
            openOrders: this.bot.openOrders.length,
        };
    }

    /**
     * Método principal que se ejecuta periódicamente para evaluar el estado del sistema.
     */
    async runDiagnostics() {
        console.log("Running Helios AI Director diagnostics...");
        this.alerts = [];

        await this._checkProviderHealth();
    }

    async _checkProviderHealth() {
        if (!this.selector || !this.selector.providers) return;

        for (const providerId in this.selector.providers) {
            const provider = this.selector.providers[providerId];
            if (provider.isAvailable()) {
                try {
                    await provider.fetchWithMetrics();
                } catch (error) {
                    const errorMessage = `Connection failed for data provider: ${providerId}. Reason: ${error.message}`;
                    this._generateAlert('PROVIDER_FAILURE', errorMessage, providerId);
                    this.memory.logEvent('ERROR', errorMessage, 'AutonomousDirector');
                }
            }
        }
    }

    _generateAlert(type, message, source) {
        const newAlert = {
            id: `${type}_${source}_${Date.now()}`,
            type: type,
            message: message,
            recommendation: this._getRecommendationForAlert(type, source),
            timestamp: new Date().toISOString(),
        };
        this.alerts.push(newAlert);
    }

    _getRecommendationForAlert(type, source) {
        switch (type) {
            case 'PROVIDER_FAILURE':
                return `Provider '${source}' is failing. It's recommended to switch to 'Automatic' mode or select a different provider in Settings to ensure stable market data.`;
            default:
                return 'No specific recommendation available. Please check system logs.';
        }
    }

    getAlerts() {
        return this.alerts;
    }
}

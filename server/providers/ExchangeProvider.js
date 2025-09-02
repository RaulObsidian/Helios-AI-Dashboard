// server/providers/ExchangeProvider.js
import { BaseProvider } from './BaseProvider.js';
import ccxt from 'ccxt';

export class ExchangeProvider extends BaseProvider {
    constructor(providerId, symbol) {
        super(providerId, 'CEX');
        this.symbol = symbol;
        
        if (!ccxt.hasOwnProperty(providerId)) {
            throw new Error(`Exchange ${providerId} is not supported by CCXT.`);
        }
        this.exchange = new ccxt[providerId]();
    }

    async _fetchImplementation(currency) {
        return await this.exchange.fetchTicker(this.symbol);
    }

    _normalize(raw_data, currency) {
        // La conversión de BTC a USD se manejará en una etapa posterior si es necesario.
        return {
            price: raw_data.last || 0,
            volume: raw_data.baseVolume || 0,
            marketCap: 0, // No disponible en tickers de CEX
            provider: this.id,
        };
    }
}

// server/providers/CoinPaprikaProvider.js
import { BaseProvider } from './BaseProvider.js';

export class CoinPaprikaProvider extends BaseProvider {
    constructor() {
        super('CoinPaprika', 'AGGREGATOR');
        this.baseUrl = 'https://api.coinpaprika.com/v1/tickers/scp-scprime';
    }

    async _fetchImplementation(currency) {
        const response = await fetch(this.baseUrl);
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        return await response.json();
    }

    _normalize(raw_data, currency) {
        const quote = raw_data.quotes[currency.toUpperCase()];
        if (!quote) {
            throw new Error(`Currency ${currency} not found in CoinPaprika response`);
        }
        return {
            price: quote.price || 0,
            marketCap: quote.market_cap || 0,
            volume: quote.volume_24h || 0,
            provider: this.id,
        };
    }
}

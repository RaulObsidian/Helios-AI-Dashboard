// server/providers/CoinPaprikaProvider.js
import { BaseProvider } from './BaseProvider.js';

export class CoinPaprikaProvider extends BaseProvider {
    constructor() {
        super('CoinPaprika', 'AGGREGATOR');
        this.baseUrl = 'https://api.coinpaprika.com/v1/tickers/scp-scprime';
    }

    async _fetch() {
        const response = await fetch(this.baseUrl);
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        return await response.json();
    }

    _normalize(data) {
        const quote = data.quotes['USD']; // Asumimos USD
        if (!quote) {
            throw new Error(`USD quote not found in CoinPaprika response`);
        }
        return {
            price: quote.price || 0,
            marketCap: quote.market_cap || 0,
            volume: quote.volume_24h || 0,
            provider: this.id,
        };
    }
}

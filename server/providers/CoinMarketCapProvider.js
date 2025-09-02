// server/providers/CoinMarketCapProvider.js
import { BaseProvider } from './BaseProvider.js';

export class CoinMarketCapProvider extends BaseProvider {
    constructor(apiKey) {
        super('CoinMarketCap', 'AGGREGATOR');
        this.apiKey = apiKey;
        this.baseUrl = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest';
    }

    async _fetchImplementation(currency) {
        if (!this.apiKey) {
            throw new Error('CoinMarketCap API Key is required.');
        }
        const url = `${this.baseUrl}?symbol=SCP&convert=${currency.toUpperCase()}`;
        const response = await fetch(url, {
            headers: {
                'X-CMC_PRO_API_KEY': this.apiKey,
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        return await response.json();
    }

    _normalize(raw_data, currency) {
        const quote = raw_data.data.SCP.quote[currency.toUpperCase()];
        if (!quote) {
            throw new Error(`Currency ${currency} not found in CoinMarketCap response`);
        }
        return {
            price: quote.price || 0,
            marketCap: quote.market_cap || 0,
            volume: quote.volume_24h || 0,
            provider: this.id,
        };
    }
}

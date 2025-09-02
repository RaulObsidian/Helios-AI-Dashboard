// server/providers/LiveCoinWatchProvider.js
import { BaseProvider } from './BaseProvider.js';

export class LiveCoinWatchProvider extends BaseProvider {
    constructor(apiKey) {
        super('LiveCoinWatch', 'AGGREGATOR');
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.livecoinwatch.com/coins/single';
    }

    async _fetchImplementation(currency) {
        if (!this.apiKey) {
            throw new Error('LiveCoinWatch API Key is required.');
        }
        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'x-api-key': this.apiKey,
            },
            body: JSON.stringify({
                currency: currency.toUpperCase(),
                code: "SCP",
                meta: true,
            }),
        });
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        return await response.json();
    }

    _normalize(raw_data, currency) {
        return {
            price: raw_data.rate || 0,
            marketCap: raw_data.cap || 0,
            volume: raw_data.volume || 0,
            provider: this.id,
        };
    }
}

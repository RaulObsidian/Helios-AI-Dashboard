// server/providers/LiveCoinWatchProvider.js
import { BaseProvider } from './BaseProvider.js';

export class LiveCoinWatchProvider extends BaseProvider {
    constructor(apiKey) {
        super('LiveCoinWatch', 'AGGREGATOR');
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.livecoinwatch.com/coins/single';
    }

    async _fetch() {
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
                currency: 'USD',
                code: "SCP",
                meta: true,
            }),
        });
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        return await response.json();
    }

    _normalize(data) {
        return {
            price: data.rate || 0,
            marketCap: data.cap || 0,
            volume: data.volume || 0,
            provider: this.id,
        };
    }
}

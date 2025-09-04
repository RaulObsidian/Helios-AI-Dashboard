// server/providers/CryptoCompareProvider.js
import { BaseProvider } from './BaseProvider.js';

export class CryptoCompareProvider extends BaseProvider {
    constructor(apiKey) {
        super('CryptoCompare', 'AGGREGATOR');
        this.apiKey = apiKey;
        this.baseUrl = 'https://min-api.cryptocompare.com/data/pricemultifull';
    }

    async _fetch() {
        if (!this.apiKey) {
            throw new Error('CryptoCompare API Key is required.');
        }
        const url = `${this.baseUrl}?fsyms=SCP&tsyms=USD&api_key=${this.apiKey}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        return await response.json();
    }

    _normalize(data) {
        const rawData = data.RAW?.SCP?.['USD'];
        if (!rawData) {
            throw new Error(`USD data not found in CryptoCompare response`);
        }
        return {
            price: rawData.PRICE || 0,
            marketCap: rawData.MKTCAP || 0,
            volume: rawData.VOLUME24HOURTO || 0,
            provider: this.id,
        };
    }
}

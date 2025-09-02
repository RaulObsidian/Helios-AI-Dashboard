// server/providers/CryptoCompareProvider.js
import { BaseProvider } from './BaseProvider.js';

export class CryptoCompareProvider extends BaseProvider {
    constructor(apiKey) {
        super('CryptoCompare', 'AGGREGATOR');
        this.apiKey = apiKey;
        this.baseUrl = 'https://min-api.cryptocompare.com/data/pricemultifull';
    }

    async _fetchImplementation(currency) {
        if (!this.apiKey) {
            throw new Error('CryptoCompare API Key is required.');
        }
        const url = `${this.baseUrl}?fsyms=SCP&tsyms=${currency.toUpperCase()}&api_key=${this.apiKey}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        return await response.json();
    }

    _normalize(raw_data, currency) {
        const data = raw_data.RAW?.SCP?.[currency.toUpperCase()];
        if (!data) {
            throw new Error(`Currency ${currency} not found in CryptoCompare response`);
        }
        return {
            price: data.PRICE || 0,
            marketCap: data.MKTCAP || 0,
            volume: data.VOLUME24HOURTO || 0,
            provider: this.id,
        };
    }
}

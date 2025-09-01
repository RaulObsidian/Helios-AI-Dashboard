// server/providers/CoinGeckoProvider.js
import { BaseProvider } from './BaseProvider.js';

export class CoinGeckoProvider extends BaseProvider {
    constructor() {
        super('CoinGecko', 'AGGREGATOR');
        this.baseUrl = 'https://api.coingecko.com/api/v3/coins/markets';
    }

    async _fetchImplementation(currency) {
        const url = `${this.baseUrl}?vs_currency=${currency.toLowerCase()}&ids=scprime`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        return await response.json();
    }

    _normalize(raw_data, currency) {
        if (!raw_data || raw_data.length === 0) {
            // Devuelve 0 en lugar de lanzar error para que el SmartSelector pueda penalizar y probar otro.
            console.warn('CoinGecko API returned an empty array for scprime.');
            return { price: 0, marketCap: 0, volume: 0, provider: this.id };
        }
        const data = raw_data[0];
        return {
            price: data.current_price || 0,
            marketCap: data.market_cap || 0,
            volume: data.total_volume || 0,
            provider: this.id,
        };
    }
}

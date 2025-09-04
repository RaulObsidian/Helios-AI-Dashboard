// server/providers/CoinGeckoProvider.js
import { BaseProvider } from './BaseProvider.js';

export class CoinGeckoProvider extends BaseProvider {
    constructor() {
        super('CoinGecko', 'AGGREGATOR');
        this.baseUrl = 'https://api.coingecko.com/api/v3/coins/markets';
    }

    async _fetch() {
        const url = `${this.baseUrl}?vs_currency=usd&ids=scprime`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        const data = await response.json();
        if (!data || data.length === 0) {
            // Lanzar un error específico que p-retry puede capturar
            throw new Error('CoinGecko API returned an empty array for scprime.');
        }
        return data[0];
    }

    _normalize(data) {
        return {
            price: data.current_price || 0,
            marketCap: data.market_cap || 0,
            volume: data.total_volume || 0,
            provider: this.id,
        };
    }
}

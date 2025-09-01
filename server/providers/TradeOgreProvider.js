// server/providers/TradeOgreProvider.js
import { BaseProvider } from './BaseProvider.js';

export class TradeOgreProvider extends BaseProvider {
    constructor() {
        super('TradeOgre', 'CEX');
        this.baseUrl = 'https://tradeogre.com/api/v1/ticker/SCP-USDT';
    }

    async _fetchImplementation(currency) {
        // TradeOgre solo tiene par USDT, así que ignoramos la moneda por ahora.
        const response = await fetch(this.baseUrl);
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        return await response.json();
    }

    _normalize(raw_data, currency) {
        return {
            price: parseFloat(raw_data.price) || 0,
            marketCap: 0, // No disponible
            volume: parseFloat(raw_data.volume) || 0,
            provider: this.id,
        };
    }
}

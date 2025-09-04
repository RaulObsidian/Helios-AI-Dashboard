// server/providers/SouthXchangeProvider.js
import { BaseProvider } from './BaseProvider.js';

export class SouthXchangeProvider extends BaseProvider {
    constructor() {
        super('SouthXchange', 'AGGREGATOR'); 
        this.baseUrl = 'https://www.southxchange.com/api/v3/book/SCP/USDT';
    }

    async _fetch() {
        const response = await fetch(this.baseUrl);
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        return await response.json();
    }

    _normalize(data) {
        // Tomaremos el precio de la primera orden de compra como referencia.
        const price = data.BuyOrders.length > 0 ? data.BuyOrders[0].Price : 0;
        return {
            price: parseFloat(price) || 0,
            marketCap: 0,
            volume: 0,
            provider: this.id,
        };
    }
}

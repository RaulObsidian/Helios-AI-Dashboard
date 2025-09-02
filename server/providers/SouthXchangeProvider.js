// server/providers/SouthXchangeProvider.js
import { BaseProvider } from './BaseProvider.js';

export class SouthXchangeProvider extends BaseProvider {
    constructor() {
        // Lo tratamos como un agregador ya que no está en CCXT
        super('SouthXchange', 'AGGREGATOR'); 
        this.baseUrl = 'https://www.southxchange.com/api/v3/book/SCP/USDT';
    }

    async _fetchImplementation(currency) {
        // SouthXchange solo tiene par USDT, así que ignoramos la moneda por ahora.
        const response = await fetch(this.baseUrl);
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        return await response.json();
    }

    _normalize(raw_data, currency) {
        // La API de SouthXchange devuelve el precio en el libro de órdenes.
        // Tomaremos el precio de la primera orden de compra como referencia.
        const price = raw_data.BuyOrders.length > 0 ? raw_data.BuyOrders[0].Price : 0;
        return {
            price: parseFloat(price) || 0,
            marketCap: 0, // No disponible
            volume: 0, // No disponible en este endpoint
            provider: this.id,
        };
    }
}
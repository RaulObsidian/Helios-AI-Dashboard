// server/providers/JupiterProvider.js
import { BaseProvider } from './BaseProvider.js';

export class JupiterProvider extends BaseProvider {
    constructor() {
        super('Jupiter', 'DEX');
        // La API de Jupiter para obtener el precio de un token específico (wSCP) es más compleja.
        // Usaremos la API de precios v4. Se necesita la dirección del token de wSCP en Solana.
        this.baseUrl = 'https://price.jup.ag/v4/price';
        this.wscpTokenAddress = 'SCPSPL……'; // <-- DIRECCIÓN REAL DEL TOKEN wSCP NECESARIA
    }

    async _fetchImplementation(currency) {
        // Jupiter devuelve precios en USDC (un stablecoin de USD) por defecto.
        const url = `${this.baseUrl}?ids=${this.wscpTokenAddress}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        return await response.json();
    }

    _normalize(raw_data, currency) {
        const data = raw_data.data[this.wscpTokenAddress];
        if (!data) {
            throw new Error('wSCP token not found in Jupiter API response');
        }
        return {
            price: data.price || 0,
            marketCap: 0, // No disponible
            volume: 0, // No disponible directamente
            provider: this.id,
        };
    }
}

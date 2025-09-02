// server/providers/BirdeyeProvider.js
import { BaseProvider } from './BaseProvider.js';

export class BirdeyeProvider extends BaseProvider {
    constructor() {
        super('Birdeye', 'DEX');
        // La API de Birdeye también necesita la dirección del token.
        this.baseUrl = 'https://public-api.birdeye.so/defi/price';
        this.wscpTokenAddress = 'SCPSPL……'; // <-- DIRECCIÓN REAL DEL TOKEN wSCP NECESARIA
    }

    async _fetchImplementation(currency) {
        const url = `${this.baseUrl}?address=${this.wscpTokenAddress}`;
        const response = await fetch(url, {
            headers: { 'X-API-KEY': 'TU_API_KEY_BIRDEYE' } // Birdeye requiere una API Key
        });
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        return await response.json();
    }

    _normalize(raw_data, currency) {
        if (!raw_data.data) {
            throw new Error('Invalid data in Birdeye API response');
        }
        return {
            price: raw_data.data.value || 0,
            marketCap: 0, // No disponible
            volume: 0, // No disponible directamente
            provider: this.id,
        };
    }
}

// server/providers/BirdeyeProvider.js
import { BaseProvider } from './BaseProvider.js';

export class BirdeyeProvider extends BaseProvider {
    constructor() {
        super('Birdeye', 'DEX');
        this.baseUrl = 'https://public-api.birdeye.so/defi/price';
        // TODO: La dirección real del token wSCP en Solana es necesaria.
        this.wscpTokenAddress = 'SCPSPLXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
        // TODO: Birdeye requiere una API Key que debe ser gestionada por el SecurityManager.
        this.apiKey = null; 
    }

    async _fetch() {
        if (this.wscpTokenAddress.startsWith('SCPSPL')) {
            throw new Error('Birdeye provider is not configured. Real wSCP token address is needed.');
        }
        if (!this.apiKey) {
            throw new Error('Birdeye provider is not configured. API Key is required.');
        }
        const url = `${this.baseUrl}?address=${this.wscpTokenAddress}`;
        const response = await fetch(url, {
            headers: { 'X-API-KEY': this.apiKey }
        });
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        return await response.json();
    }

    _normalize(data) {
        if (!data.data) {
            throw new Error('Invalid data in Birdeye API response');
        }
        return {
            price: data.data.value || 0,
            marketCap: 0,
            volume: 0,
            provider: this.id,
        };
    }
}

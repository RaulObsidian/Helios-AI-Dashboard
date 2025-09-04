// server/providers/JupiterProvider.js
import { BaseProvider } from './BaseProvider.js';

export class JupiterProvider extends BaseProvider {
    constructor() {
        super('Jupiter', 'DEX');
        this.baseUrl = 'https://price.jup.ag/v4/price';
        // TODO: La dirección real del token wSCP en Solana es necesaria.
        this.wscpTokenAddress = 'SCPSPLXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'; 
    }

    async _fetch() {
        if (this.wscpTokenAddress.startsWith('SCPSPL')) {
            throw new Error('Jupiter provider is not configured. Real wSCP token address is needed.');
        }
        const url = `${this.baseUrl}?ids=${this.wscpTokenAddress}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        return await response.json();
    }

    _normalize(data) {
        const tokenData = data.data[this.wscpTokenAddress];
        if (!tokenData) {
            throw new Error('wSCP token not found in Jupiter API response');
        }
        return {
            price: tokenData.price || 0,
            marketCap: 0,
            volume: 0,
            provider: this.id,
        };
    }
}

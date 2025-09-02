// server/SmartSelector.js
import { CoinExProvider } from './providers/CoinExProvider.js';
import { TradeOgreProvider } from './providers/TradeOgreProvider.js';
import { SouthXchangeProvider } from './providers/SouthXchangeProvider.js';
import { CoinGeckoProvider } from './providers/CoinGeckoProvider.js';
import { CoinPaprikaProvider } from './providers/CoinPaprikaProvider.js';
// Faltan los proveedores con API Key y los DEX

import { JupiterProvider } from './providers/JupiterProvider.js';
import { BirdeyeProvider } from './providers/BirdeyeProvider.js';
// ... (resto de imports)

export class SmartSelector {
    constructor() {
        this.providers = {
            'CoinEx': new CoinExProvider(),
            'TradeOgre': new TradeOgreProvider(),
            'SouthXchange': new SouthXchangeProvider(),
            'CoinGecko': new CoinGeckoProvider(),
            'CoinPaprika': new CoinPaprikaProvider(),
            'Jupiter': new JupiterProvider(),
            'Birdeye': new BirdeyeProvider(),
            // Faltan los proveedores con API Key
        };
        // Lista priorizada para el modo automático
        this.autoProviderList = ['TradeOgre', 'CoinEx', 'CoinPaprika', 'CoinGecko', 'SouthXchange', 'Jupiter', 'Birdeye'];
    }
// ... (resto del archivo)

    scoreProvider(provider) {
        if (provider.success_rate > 0.95) {
            if (provider.latency === 0) return provider.success_rate;
            const latencyBonus = Math.max(0, (5000 - provider.latency) / 5000) * 0.05;
            return provider.success_rate + latencyBonus;
        }
        return provider.success_rate;
    }

    async getMarketData(providerSelection) {
        if (providerSelection === 'Automatic') {
            for (const providerId of this.autoProviderList) {
                try {
                    const provider = this.providers[providerId];
                    const data = await provider.fetch();
                    if (data.price > 0) {
                        return data;
                    }
                } catch (error) {
                    console.warn(`Automatic mode: ${providerId} failed. Trying next.`);
                }
            }
            throw new Error("All automatic providers failed.");
        } else {
            const provider = this.providers[providerSelection];
            if (!provider) {
                throw new Error(`Provider ${providerSelection} not found.`);
            }
            return await provider.fetch();
        }
    }
}

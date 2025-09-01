// server/SmartSelector.js
import { CoinGeckoProvider } from './providers/CoinGeckoProvider.js';
import { CoinPaprikaProvider } from './providers/CoinPaprikaProvider.js';
import { TradeOgreProvider } from './providers/TradeOgreProvider.js';
// ... importaremos más proveedores aquí

export class SmartSelector {
    constructor() {
        this.providers = {
            'CoinGecko': new CoinGeckoProvider(),
            'CoinPaprika': new CoinPaprikaProvider(),
            'TradeOgre': new TradeOgreProvider(),
            // ... inicializaremos más proveedores aquí
        };
        // Lista priorizada para el modo automático
        this.autoProviderList = ['TradeOgre', 'CoinPaprika', 'CoinGecko'];
    }

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
            // Lógica automática: prueba los proveedores en orden hasta que uno funcione
            for (const providerId of this.autoProviderList) {
                try {
                    const provider = this.providers[providerId];
                    const data = await provider.fetch();
                    if (data.price > 0) { // Asegurarse de que no sea una respuesta vacía normalizada
                        return data;
                    }
                } catch (error) {
                    console.warn(`Automatic mode: ${providerId} failed. Trying next.`);
                }
            }
            throw new Error("All automatic providers failed.");
        } else {
            // Lógica manual
            const provider = this.providers[providerSelection];
            if (!provider) {
                throw new Error(`Provider ${providerSelection} not found.`);
            }
            return await provider.fetch();
        }
    }
}

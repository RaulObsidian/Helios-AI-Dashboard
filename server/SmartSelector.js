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

import { CoinMarketCapProvider } from './providers/CoinMarketCapProvider.js';
import { CryptoCompareProvider } from './providers/CryptoCompareProvider.js';
import { LiveCoinWatchProvider } from './providers/LiveCoinWatchProvider.js';

export class SmartSelector {
    constructor(dbManager, securityManager) {
        this.dbManager = dbManager;
        this.securityManager = securityManager;
        this.providers = {
            'CoinEx': new CoinExProvider(),
            'TradeOgre': new TradeOgreProvider(),
            'SouthXchange': new SouthXchangeProvider(),
            'CoinGecko': new CoinGeckoProvider(),
            'CoinPaprika': new CoinPaprikaProvider(),
            'Jupiter': new JupiterProvider(),
            'Birdeye': new BirdeyeProvider(),
        };
        this._initializeApiProviders();
        // Lista priorizada para el modo automático
        this.autoProviderList = ['TradeOgre', 'CoinEx', 'CoinPaprika', 'CoinGecko', 'SouthXchange', 'Jupiter', 'Birdeye'];
    }

    async _initializeApiProviders() {
        if (!this.securityManager || !this.dbManager) return;

        // CoinMarketCap
        try {
            const cmcApiKeyRecord = await this.dbManager.getApiKey('CoinMarketCap');
            if (cmcApiKeyRecord && cmcApiKeyRecord.api_key) {
                const decryptedKey = this.securityManager.decryptData(cmcApiKeyRecord.api_key);
                this.providers['CoinMarketCap'] = new CoinMarketCapProvider(decryptedKey);
                this.autoProviderList.push('CoinMarketCap');
            }
        } catch (error) {
            console.error("Failed to initialize CoinMarketCap provider:", error.message);
        }

        // CryptoCompare
        try {
            const ccApiKeyRecord = await this.dbManager.getApiKey('CryptoCompare');
            if (ccApiKeyRecord && ccApiKeyRecord.api_key) {
                const decryptedKey = this.securityManager.decryptData(ccApiKeyRecord.api_key);
                this.providers['CryptoCompare'] = new CryptoCompareProvider(decryptedKey);
                this.autoProviderList.push('CryptoCompare');
            }
        } catch (error) {
            console.error("Failed to initialize CryptoCompare provider:", error.message);
        }

        // LiveCoinWatch
        try {
            const lcwApiKeyRecord = await this.dbManager.getApiKey('LiveCoinWatch');
            if (lcwApiKeyRecord && lcwApiKeyRecord.api_key) {
                const decryptedKey = this.securityManager.decryptData(lcwApiKeyRecord.api_key);
                this.providers['LiveCoinWatch'] = new LiveCoinWatchProvider(decryptedKey);
                this.autoProviderList.push('LiveCoinWatch');
            }
        } catch (error) {
            console.error("Failed to initialize LiveCoinWatch provider:", error.message);
        }
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

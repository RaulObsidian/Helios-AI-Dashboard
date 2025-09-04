// server/SmartSelector.js
import { CoinExProvider } from './providers/CoinExProvider.js';
import { TradeOgreProvider } from './providers/TradeOgreProvider.js';
import { SouthXchangeProvider } from './providers/SouthXchangeProvider.js';
import { CoinGeckoProvider } from './providers/CoinGeckoProvider.js';
import { CoinPaprikaProvider } from './providers/CoinPaprikaProvider.js';
import { JupiterProvider } from './providers/JupiterProvider.js';
import { BirdeyeProvider } from './providers/BirdeyeProvider.js';
import { CoinMarketCapProvider } from './providers/CoinMarketCapProvider.js';
import { CryptoCompareProvider } from './providers/CryptoCompareProvider.js';
import { LiveCoinWatchProvider } from './providers/LiveCoinWatchProvider.js';
import NodeCache from 'node-cache';

export class SmartSelector {
    constructor(dbManager, securityManager) {
        this.dbManager = dbManager;
        this.securityManager = securityManager;
        // Caché con TTL de 60 segundos
        this.cache = new NodeCache({ stdTTL: 60 }); 
        this.providers = {
            'CoinEx': new CoinExProvider(),
            'TradeOgre': new TradeOgreProvider(),
            'SouthXchange': new SouthXchangeProvider(),
            'CoinGecko': new CoinGeckoProvider(),
            'CoinPaprika': new CoinPaprikaProvider(),
            'Jupiter': new JupiterProvider(),
            'Birdeye': new BirdeyeProvider(),
        };
        // Los proveedores con API Key se inicializan después
    }

    async _initializeApiProviders() {
        if (!this.securityManager || !this.dbManager) return;

        const keyConfigs = [
            { name: 'CoinMarketCap', ProviderClass: CoinMarketCapProvider },
            { name: 'CryptoCompare', ProviderClass: CryptoCompareProvider },
            { name: 'LiveCoinWatch', ProviderClass: LiveCoinWatchProvider },
            // TODO: Añadir Birdeye aquí cuando se gestione su API Key
        ];

        for (const config of keyConfigs) {
            try {
                const apiKeyRecord = await this.dbManager.getApiKey(config.name);
                if (apiKeyRecord && apiKeyRecord.api_key) {
                    const decryptedKey = this.securityManager.decryptData(apiKeyRecord.api_key);
                    this.providers[config.name] = new config.ProviderClass(decryptedKey);
                }
            } catch (error) {
                console.error(`Failed to initialize ${config.name} provider: ${error.message}`);
            }
        }
    }

    _scoreProvider(provider) {
        // Si la tasa de éxito es muy baja, penalizar fuertemente.
        if (provider.success_rate < 0.2) {
            return 0;
        }
        // La puntuación principal es la tasa de éxito.
        // La latencia actúa como un bonus/desempate.
        // Un bono máximo de 0.1 para latencias muy bajas (<100ms).
        const latencyBonus = Math.max(0, (2000 - provider.latency) / 20000); // Normalizado
        return provider.success_rate + latencyBonus;
    }

    _selectBestProvider() {
        const availableProviders = Object.values(this.providers).filter(p => p.isAvailable());
        if (availableProviders.length === 0) return null;

        // Ordenar proveedores por su puntuación de mayor a menor
        availableProviders.sort((a, b) => this._scoreProvider(b) - this._scoreProvider(a));

        const bestProvider = availableProviders[0];
        console.log(`[SmartSelector] Best provider selected: ${bestProvider.id} (Score: ${this._scoreProvider(bestProvider).toFixed(3)})`);
        
        return bestProvider;
    }

    async getMarketData(providerSelection) {
        const cacheKey = `market_data_${providerSelection}`;
        const cachedData = this.cache.get(cacheKey);

        if (cachedData) {
            console.log(`[Cache Hit] Returning cached data for ${providerSelection}.`);
            return cachedData;
        }

        console.log(`[Cache Miss] Fetching fresh data for ${providerSelection}.`);
        let data;

        if (providerSelection === 'Automatic') {
            const bestProvider = this._selectBestProvider();
            if (!bestProvider) {
                throw new Error("No providers available to fetch market data.");
            }
            data = await bestProvider.fetchWithMetrics();
        } else {
            const provider = this.providers[providerSelection];
            if (!provider) {
                throw new Error(`Provider ${providerSelection} not found or not initialized.`);
            }
            data = await provider.fetchWithMetrics();
        }

        this.cache.set(cacheKey, data);
        return data;
    }
}

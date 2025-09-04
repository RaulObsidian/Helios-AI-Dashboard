// server/providers/TradeOgreProvider.js
import { BaseProvider } from './BaseProvider.js';

export class TradeOgreProvider extends BaseProvider {
    constructor() {
        super('TradeOre', 'CEX');
        this.baseUrl = 'https://tradeogre.com/api/v1';
    }

    async _fetch() {
        // 1. Obtener el ticker de SCP/BTC de TradeOgre
        const tickerUrl = `${this.baseUrl}/ticker/SCP-BTC`;
        const tickerResponse = await fetch(tickerUrl);
        if (!tickerResponse.ok) {
            throw new Error(`TradeOgre API request failed with status ${tickerResponse.status}`);
        }
        const tickerData = await tickerResponse.json();
        if (!tickerData.success) {
            throw new Error('TradeOgre API returned success: false');
        }

        // 2. Obtener el precio de BTC/USD de una fuente fiable (CoinGecko)
        const btcPriceUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd';
        const btcResponse = await fetch(btcPriceUrl);
        if (!btcResponse.ok) {
            throw new Error('Failed to fetch BTC price from CoinGecko for conversion.');
        }
        const btcPriceData = await btcResponse.json();
        const btcPriceUsd = btcPriceData.bitcoin.usd;

        // 3. Adjuntar el precio de BTC a los datos para la normalización
        tickerData.btcPriceUsd = btcPriceUsd;
        return tickerData;
    }

    _normalize(data) {
        const priceInBtc = parseFloat(data.price);
        const priceInUsd = priceInBtc * data.btcPriceUsd;

        return {
            price: priceInUsd || 0,
            marketCap: 0, // No disponible
            volume: parseFloat(data.volume) || 0, // Volumen en USD
            provider: this.id,
        };
    }
}

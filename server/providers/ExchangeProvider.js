// server/providers/ExchangeProvider.js
import { BaseProvider } from './BaseProvider.js';
import ccxt from 'ccxt';

export class ExchangeProvider extends BaseProvider {
    constructor(exchangeId, symbol) {
        super(exchangeId, 'CEX');
        this.symbol = symbol;
        // Inicializamos el exchange de CCXT. No se necesita API Key para tickers públicos.
        this.exchange = new ccxt[exchangeId]();
    }

    async _fetch() {
        const ticker = await this.exchange.fetchTicker(this.symbol);
        
        // Si el par es contra BTC, necesitamos obtener el precio de BTC/USD para convertir.
        if (this.symbol.endsWith('/BTC')) {
            // Hacemos una llamada directa y fiable a CoinGecko para el precio de BTC.
            const btcPriceUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd';
            const btcResponse = await fetch(btcPriceUrl);
            if (!btcResponse.ok) {
                throw new Error('Failed to fetch BTC price from CoinGecko for conversion.');
            }
            const btcPriceData = await btcResponse.json();
            // Adjuntamos el precio de BTC al ticker para usarlo en la normalización.
            ticker.btcPriceUsd = btcPriceData.bitcoin.usd;
        }
        
        return ticker;
    }

    _normalize(ticker) {
        let priceInUsd = ticker.last;

        // Si el precio original estaba en BTC, lo convertimos a USD.
        if (this.symbol.endsWith('/BTC') && ticker.btcPriceUsd) {
            priceInUsd = ticker.last * ticker.btcPriceUsd;
        }

        return {
            price: priceInUsd || 0,
            marketCap: 0, // CCXT no proporciona market cap
            volume: ticker.baseVolume || 0, // Volumen en la moneda base (SCP)
            provider: this.id,
        };
    }
}
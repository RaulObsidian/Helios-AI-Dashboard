// server/marketService.js
import fetch from 'node-fetch';

/**
 * Normaliza los datos de diferentes APIs a una estructura común.
 * @param {object} data - Los datos crudos de la API.
 * @param {string} provider - El nombre del proveedor.
 * @returns {object} - Un objeto con price, marketCap, y volume.
 */
const normalizeData = (data, provider) => {
    if (!data) {
        throw new Error(`Invalid or empty data received from ${provider} API`);
    }

    switch (provider) {
        case 'CoinGecko':
            if (data.length === 0) throw new Error('Empty array received from CoinGecko');
            return {
                price: data[0].current_price || 0,
                marketCap: data[0].market_cap || 0,
                volume: data[0].total_volume || 0,
            };
        case 'CoinPaprika':
            return {
                price: data.quotes.USD.price || 0,
                marketCap: data.quotes.USD.market_cap || 0,
                volume: data.quotes.USD.volume_24h || 0,
            };
        case 'KuCoin':
            return {
                price: parseFloat(data.data.last) || 0,
                marketCap: 0, // No disponible
                volume: parseFloat(data.data.volValue) || 0,
            };
        case 'Gate.io':
             if (data.length === 0) throw new Error('Empty array received from Gate.io');
            return {
                price: parseFloat(data[0].last) || 0,
                marketCap: 0, // No disponible
                volume: parseFloat(data[0].base_volume) || 0,
            };
        case 'TradeOgre':
            return {
                price: parseFloat(data.price) || 0,
                marketCap: 0, // No disponible
                volume: parseFloat(data.volume) || 0,
            };
        // CoinMarketCap requiere clave de API, se omite por ahora.
        default:
            throw new Error(`Unknown data provider: ${provider}`);
    }
};

/**
 * Obtiene datos de mercado del proveedor especificado.
 * @param {string} provider - El proveedor de datos.
 * @returns {Promise<object>} - Los datos de mercado normalizados.
 */
export const fetchDataFromProvider = async (provider) => {
    let url = '';
    switch (provider) {
        case 'CoinGecko':
            url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=scprime';
            break;
        case 'CoinPaprika':
            url = 'https://api.coinpaprika.com/v1/tickers/scp-scprime';
            break;
        case 'KuCoin':
            url = 'https://api.kucoin.com/api/v1/market/stats?symbol=SCP-USDT';
            break;
        case 'Gate.io':
            url = 'https://api.gateio.ws/api/v4/spot/tickers?currency_pair=SCP_USDT';
            break;
        case 'TradeOgre':
            url = 'https://tradeogre.com/api/v1/ticker/SCP-USDT';
            break;
        default:
            throw new Error(`Invalid data provider specified: ${provider}`);
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API request to ${provider} failed with status: ${response.status}`);
        }
        const data = await response.json();
        return normalizeData(data, provider);
    } catch (error) {
        console.error(`Error fetching data from ${provider}:`, error.message);
        throw error;
    }
};
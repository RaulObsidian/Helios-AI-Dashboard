// Cache-busting comment
import type { MarketData } from '../types';
import type { AppError } from '../types';
import { DataProvider } from '../types';



/**
 * Fetches real-time market data for ScPrime from the CoinGecko API.
 * @param lastValidData The last known valid market data, used as a fallback on API failure.
 * @returns An object containing the latest market data or null if the API call fails, and an error object.
 */
export const fetchMarketData = async (lastValidData: MarketData | null): Promise<{ data: MarketData | null; error: AppError | null }> => {
    const url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=scprime';

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API request failed with status: ${response.status}`);
        }
        
        const data = await response.json();
        if (!data || data.length === 0) {
            throw new Error('Invalid or empty data received from CoinGecko API');
        }

        const marketData = data[0];
        const newMarketData: MarketData = {
            provider: DataProvider.COINGECKO,
            priceUSD: marketData.current_price || 0,
            marketCapUSD: marketData.market_cap || 0,
            volume24hUSD: marketData.total_volume || 0,
            // Calculate tick volume based on the change from the last known 24h volume
            tickVolume: (lastValidData?.volume24hUSD && marketData.total_volume) 
                ? Math.abs(marketData.total_volume - lastValidData.volume24hUSD) 
                : 0,
            // CoinGecko does not provide a direct buy/sell ratio, so we default to a neutral 0.5
            buySellRatio: 0.5, 
        };
        
        

        return { data: newMarketData, error: null };

    } catch (e: any) {
        console.error("Market Data fetch error:", e);
        const error: AppError = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            message: `Failed to fetch market data: ${e.message}. Using stale data if available.`,
            severity: 'Warning'
        };
        // On failure, return the last known data to avoid breaking the UI, along with the error
        return { data: lastValidData, error };
    }
};

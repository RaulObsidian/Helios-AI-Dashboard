import { DataProvider } from "./types";

export const MAX_PRICE_USD_TB_MONTH_INCENTIVES = 4.00;
export const SIMULATION_CYCLE_MS = 5000; // Run a simulation cycle every 5 seconds

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' },
  { code: 'ru', name: 'Русский' },
  { code: 'zh', name: '中文 (Simplified)' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'ar', name: 'العربية' },
  { code: 'hi', name: 'हिन्दी' },
];

export const CURRENCIES = [
    { code: 'USD', name: 'United States Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'CHF', name: 'Swiss Franc' },
    { code: 'CNY', name: 'Chinese Yuan' },
    { code: 'SEK', name: 'Swedish Krona' },
    { code: 'NZD', name: 'New Zealand Dollar' },
    { code: 'BRL', name: 'Brazilian Real' },
    { code: 'INR', name: 'Indian Rupee' },
];

export const DATA_PROVIDERS = [
    DataProvider.AUTO,
    DataProvider.COINGECKO,
    DataProvider.COINPAPRIKA,
    DataProvider.COINMARKETCAP,
    DataProvider.CRYPTOCOMPARE,
    DataProvider.KUCOIN,
    DataProvider.GATEIO,
    DataProvider.TRADEOGRE,
    DataProvider.COINBASE,
    DataProvider.BINANCE,
    DataProvider.KRAKEN,
];

// Separate list for trading connections, excluding 'AUTO' which is not a real exchange
export const TRADING_PROVIDERS = DATA_PROVIDERS.filter(p => p !== DataProvider.AUTO);

// server/providers/CoinExProvider.js
import { ExchangeProvider } from './ExchangeProvider.js';

export class CoinExProvider extends ExchangeProvider {
    constructor() {
        super('coinex', 'SCP/USDT');
    }
}

// server/providers/TradeOgreProvider.js
import { ExchangeProvider } from './ExchangeProvider.js';

export class TradeOgreProvider extends ExchangeProvider {
    constructor() {
        // Nota: TradeOgre usa SCP/BTC. La conversión a USD se hará si es necesario.
        super('tradeogre', 'SCP/BTC');
    }
}

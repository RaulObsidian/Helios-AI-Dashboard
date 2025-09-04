// server/strategies/GridStrategy.js
import { BaseStrategy } from './BaseStrategy.js';

/**
 * @class GridStrategy
 * @description Implementa la estrategia de Grid Trading.
 */
export class GridStrategy extends BaseStrategy {
    constructor(config) {
        super('GridTrading', config);
        this.gridLevels = [];
    }

    /**
     * @description Calcula los niveles de precios para la rejilla.
     */
    _calculateGridLevels() {
        const { lowerPrice, upperPrice, gridSize } = this.config;
        this.gridLevels = [];
        const step = (upperPrice - lowerPrice) / (gridSize - 1);

        for (let i = 0; i < gridSize; i++) {
            const price = lowerPrice + (i * step);
            this.gridLevels.push({
                price: parseFloat(price.toFixed(6)), // Redondear a 6 decimales para precisión
                type: null, // 'buy' o 'sell', se determinará en el tick
            });
        }
    }

    /**
     * @description Inicializa la estrategia y define las primeras órdenes a colocar.
     * @param {object} marketData - Contiene el precio actual.
     * @returns {Array<object>} - Acciones iniciales.
     */
    initialize(marketData) {
        this._calculateGridLevels();
        const currentPrice = marketData.price;
        const actions = [];
        const { investment } = this.config;
        
        const buyLevels = this.gridLevels.filter(level => level.price < currentPrice);
        const sellLevels = this.gridLevels.filter(level => level.price > currentPrice);

        if (buyLevels.length === 0 || sellLevels.length === 0) {
            throw new Error("El precio actual está fuera del rango de la rejilla. No se pueden colocar órdenes iniciales.");
        }

        const investmentPerBuyOrder = investment / buyLevels.length;
        
        // Crear órdenes de compra por debajo del precio actual
        for (const level of buyLevels) {
            const amount = investmentPerBuyOrder / level.price;
            actions.push({
                type: 'CREATE_ORDER',
                params: {
                    symbol: 'SCP/USDT', // TODO: Hacer configurable
                    type: 'limit',
                    side: 'buy',
                    amount: amount,
                    price: level.price,
                }
            });
        }

        // Las órdenes de venta se crearán cuando se ejecute una orden de compra.
        console.log(`[GridStrategy] Inicializada. ${actions.length} órdenes de compra calculadas.`);
        return actions;
    }

    /**
     * @description Lógica principal que se ejecuta en cada tick.
     * @param {object} marketData - Datos de mercado.
     * @param {Array<object>} openOrders - Órdenes abiertas.
     * @returns {Array<object>} - Nuevas acciones.
     */
    onTick(marketData, openOrders) {
        const actions = [];
        const filledBuyOrders = this._findFilledBuyOrders(openOrders); // Lógica a implementar

        for (const filledOrder of filledBuyOrders) {
            // Por cada orden de compra completada, crear una orden de venta en el siguiente nivel superior.
            const sellPrice = this._findNextGridLevel(filledOrder.price);
            if (sellPrice) {
                actions.push({
                    type: 'CREATE_ORDER',
                    params: {
                        symbol: 'SCP/USDT',
                        type: 'limit',
                        side: 'sell',
                        amount: filledOrder.amount,
                        price: sellPrice,
                    }
                });
            }
        }
        
        // Lógica adicional:
        // - Re-crear órdenes de compra si el precio sube y se completan ventas.
        // - Cancelar órdenes si el precio sale del rango.

        return actions;
    }

    // Métodos auxiliares (a implementar)
    _findFilledBuyOrders(openOrders) { 
        // Lógica para comparar órdenes previas con las actuales y detectar las que se completaron.
        // Por ahora, devolvemos un array vacío.
        return [];
    }

    _findNextGridLevel(price) {
        const currentIndex = this.gridLevels.findIndex(level => level.price === price);
        if (currentIndex !== -1 && currentIndex + 1 < this.gridLevels.length) {
            return this.gridLevels[currentIndex + 1].price;
        }
        return null;
    }
}

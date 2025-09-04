// server/strategies/BaseStrategy.js

/**
 * @class BaseStrategy
 * @description Clase base abstracta para todas las estrategias de trading.
 * Define la interfaz que el motor del bot utilizará para interactuar con una estrategia.
 * Esto permite que las estrategias sean intercambiables (plug-and-play).
 */
export class BaseStrategy {
    constructor(strategyName, config) {
        if (this.constructor === BaseStrategy) {
            throw new Error("La clase base abstracta 'BaseStrategy' no puede ser instanciada directamente.");
        }
        this.name = strategyName;
        this.config = config;
        this.state = 'STOPPED'; // STOPPED, RUNNING
    }

    /**
     * @description Inicializa la estrategia, calculando los puntos de acción iniciales.
     * @param {object} marketData - Datos de mercado actuales (ej. precio).
     * @returns {Array<object>} - Una lista de acciones iniciales (ej. órdenes a colocar).
     */
    initialize(marketData) {
        throw new Error("El método 'initialize' debe ser implementado por la subclase.");
    }

    /**
     * @description Se ejecuta en cada 'tick' del bot para evaluar la situación del mercado.
     * @param {object} marketData - Datos de mercado actuales.
     * @param {Array<object>} openOrders - Las órdenes actualmente abiertas en el exchange.
     * @returns {Array<object>} - Una lista de nuevas acciones a tomar (ej. crear/cancelar órdenes).
     */
    onTick(marketData, openOrders) {
        throw new Error("El método 'onTick' debe ser implementado por la subclase.");
    }

    /**
     * @description Actualiza la configuración de la estrategia en tiempo de ejecución.
     * @param {object} newConfig - La nueva configuración.
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        console.log(`[${this.name}] Configuración actualizada.`);
    }

    start() {
        this.state = 'RUNNING';
    }

    stop() {
        this.state = 'STOPPED';
    }
}

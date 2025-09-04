// server/TradingBot.js
import { EventEmitter } from 'events';

/**
 * @class TradingBot
 * @description Motor principal de trading. Es agnóstico a la estrategia.
 * Gestiona la máquina de estados, el ciclo de vida y el bucle de 'tick'.
 * Emite eventos para notificar cambios de estado o acciones.
 */
export class TradingBot extends EventEmitter {
    constructor(exchangeConnector) {
        super();
        this.state = 'IDLE'; // IDLE, RUNNING, PAUSED, ERROR
        this.strategy = null;
        this.exchange = exchangeConnector; // Módulo para interactuar con el exchange
        this.tickInterval = null;
        this.tickSpeed = 15000; // 15 segundos por defecto
        this.openOrders = [];
        this.pnl = 0;
    }

    /**
     * @description Carga y configura una estrategia de trading.
     * @param {BaseStrategy} strategyInstance - Una instancia de una estrategia que herede de BaseStrategy.
     */
    configure(strategyInstance) {
        if (this.state !== 'IDLE') {
            throw new Error('El bot solo puede ser configurado en estado IDLE.');
        }
        this.strategy = strategyInstance;
        this.state = 'CONFIGURED';
        console.log(`[TradingBot] Configurado con la estrategia: ${this.strategy.name}`);
        this.emit('configured', this.strategy.config);
    }

    async start() {
        if (this.state !== 'CONFIGURED') {
            throw new Error('El bot debe estar configurado para poder iniciar.');
        }
        
        console.log('[TradingBot] Iniciando...');
        this.state = 'RUNNING';
        this.strategy.start();

        // 1. Obtener datos de mercado iniciales
        const marketData = await this.exchange.getMarketData();

        // 2. Inicializar la estrategia para obtener las órdenes iniciales
        const initialActions = this.strategy.initialize(marketData);

        // 3. Ejecutar acciones iniciales (colocar órdenes)
        for (const action of initialActions) {
            if (action.type === 'CREATE_ORDER') {
                const order = await this.exchange.createOrder(action.params);
                this.openOrders.push(order);
            }
        }

        // 4. Iniciar el bucle de tick
        this.tickInterval = setInterval(() => this._tick(), this.tickSpeed);
        this.emit('started');
        console.log('[TradingBot] Iniciado y corriendo.');
    }

    stop() {
        if (!this.tickInterval) return;
        clearInterval(this.tickInterval);
        this.tickInterval = null;
        this.state = 'IDLE';
        this.strategy.stop();
        // TODO: Implementar la cancelación de todas las órdenes abiertas
        console.log('[TradingBot] Detenido.');
        this.emit('stopped');
    }

    async _tick() {
        if (this.state !== 'RUNNING') return;

        try {
            console.log('[TradingBot] Executing tick...');
            // 1. Obtener datos de mercado y órdenes abiertas actualizadas
            const marketData = await this.exchange.getMarketData();
            this.openOrders = await this.exchange.getOpenOrders();

            // 2. Dejar que la estrategia decida las acciones
            const actions = this.strategy.onTick(marketData, this.openOrders);

            // 3. Ejecutar las acciones devueltas por la estrategia
            for (const action of actions) {
                if (action.type === 'CREATE_ORDER') {
                    await this.exchange.createOrder(action.params);
                } else if (action.type === 'CANCEL_ORDER') {
                    await this.exchange.cancelOrder(action.params.id);
                }
            }
            this.emit('tick_completed');

        } catch (error) {
            console.error('[TradingBot] Error durante el tick:', error);
            this.state = 'ERROR';
            this.emit('error', error.message);
            this.stop(); // Detener el bot en caso de error
        }
    }
}

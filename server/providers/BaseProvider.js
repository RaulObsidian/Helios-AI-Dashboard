// server/providers/BaseProvider.js
import pRetry from 'p-retry';

export class BaseProvider {
    constructor(id, category) {
        this.id = id;
        this.category = category; // 'CEX', 'AGGREGATOR', 'DEX'
        this.latency = 0; // en milisegundos
        this.success_rate = 1.0; // Tasa de éxito (0.0 a 1.0)
        this.last_error = null;
        this.cooldown_until = 0; // Timestamp hasta el cual el proveedor está en cooldown
    }

    isAvailable() {
        return Date.now() > this.cooldown_until;
    }

    async fetchWithMetrics() {
        if (!this.isAvailable()) {
            const remainingCooldown = Math.ceil((this.cooldown_until - Date.now()) / 1000);
            throw new Error(`Provider ${this.id} is in cooldown for another ${remainingCooldown} seconds.`);
        }

        const startTime = Date.now();
        try {
            // Usamos p-retry para manejar los reintentos
            const data = await pRetry(() => this._fetch(), {
                retries: 2,
                onFailedAttempt: error => {
                    console.warn(`[${this.id}] Intento ${error.attemptNumber} fallido. Quedan ${error.retriesLeft} reintentos.`);
                }
            });
            
            this.latency = Date.now() - startTime;
            this._updateHealth(true);
            return this._normalize(data);

        } catch (error) {
            this.latency = Date.now() - startTime;
            this.last_error = error.message;
            this._updateHealth(false);

            // Lógica de Cooldown para errores 429
            if (error.message && error.message.includes('status 429')) {
                this.cooldown_until = Date.now() + 300000; // Cooldown de 5 minutos
                console.error(`[${this.id}] Rate Limit Hit (429). Cooling down for 5 minutes.`);
            }

            console.error(`[${this.id}] Falló después de todos los reintentos: ${error.message}`);
            throw error; // Propagar el error para que el selector lo maneje
        }
    }

    _updateHealth(success) {
        const alpha = 0.1; // Factor de suavizado para la Media Móvil Exponencial (EMA)
        const newSuccessValue = success ? 1 : 0;
        this.success_rate = alpha * newSuccessValue + (1 - alpha) * this.success_rate;
    }

    // Métodos que deben ser implementados por las clases hijas
    async _fetch() {
        throw new Error('_fetch() must be implemented by subclass');
    }

    _normalize(data) {
        throw new Error('_normalize() must be implemented by subclass');
    }
}
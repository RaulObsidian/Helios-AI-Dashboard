// server/providers/BaseProvider.js
import fetch from 'node-fetch';

// En un entorno real, esto sería más sofisticado.
// Por ahora, es una simple función de reintento.
const retry = async (fn, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (e) {
            if (i === retries - 1) throw e;
            await new Promise(res => setTimeout(res, delay));
        }
    }
};

export class BaseProvider {
    constructor(providerId, category) {
        this.id = providerId;
        this.category = category; // 'CEX', 'AGGREGATOR', 'DEX'
        this.latency = 0;
        this.success_rate = 1.0;
    }

    async fetch(currency = "USD") {
        const start_time = Date.now();
        try {
            const raw_data = await retry(() => this._fetchImplementation(currency));
            const normalized_data = this._normalize(raw_data, currency);
            this.latency = Date.now() - start_time;
            this._updateHealth(true);
            return normalized_data;
        } catch (e) {
            this.latency = Date.now() - start_time;
            this._updateHealth(false);
            console.error(`Provider ${this.id} failed after retries:`, e.message);
            throw e;
        }
    }

    _fetchImplementation(currency) {
        throw new Error("_fetchImplementation must be overridden by subclass");
    }

    _normalize(raw_data, currency) {
        throw new Error("_normalize must be overridden by subclass");
    }

    _updateHealth(success) {
        const alpha = 0.1;
        this.success_rate = alpha * (success ? 1 : 0) + (1 - alpha) * this.success_rate;
    }
}

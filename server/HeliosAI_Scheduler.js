// server/HeliosAI_Scheduler.js

/**
 * @class HeliosAI_Scheduler
 * @description Se encarga de realizar análisis pesados de mercado a intervalos regulares.
 * Su objetivo es generar una "tesis de trading" y guardarla en la memoria
 * para que el Executor pueda acceder a ella de forma instantánea.
 */
export class HeliosAI_Scheduler {
    constructor(memory, director) {
        this.memory = memory;
        this.director = director; // Necesita acceso al director para proponer configs
        this.intervalId = null;
    }

    /**
     * Inicia el ciclo de análisis periódico.
     * @param {number} interval - El intervalo en milisegundos.
     */
    start(interval = 14400000) { // 4 horas por defecto
        console.log(`[Scheduler] Iniciando ciclo de análisis cada ${interval / 1000 / 3600} horas.`);
        this.stop(); // Asegurarse de que no hay ciclos anteriores corriendo
        this.runDeepAnalysis(); // Ejecutar una vez al inicio
        this.intervalId = setInterval(() => this.runDeepAnalysis(), interval);
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('[Scheduler] Ciclo de análisis detenido.');
        }
    }

    /**
     * Ejecuta el análisis profundo y guarda la tesis.
     */
    async runDeepAnalysis() {
        console.log('[Scheduler] Ejecutando análisis profundo de mercado...');
        try {
            // 1. Proponer una configuración de bot basada en el análisis actual.
            const config = await this.director.proposeGridConfig();

            // 2. Generar la justificación (rationale).
            // En el futuro, esta lógica será mucho más compleja.
            const rationale = `Basado en la volatilidad reciente, se ha establecido un rango de trading entre ${config.lowerPrice} y ${config.upperPrice} USDT. Se utilizarán ${config.gridSize} niveles para capitalizar los movimientos de precio dentro de este corredor.`;

            // 3. Construir el objeto de la tesis.
            const thesis = {
                timestamp: new Date().toISOString(),
                config: config,
                rationale: rationale,
            };

            // 4. Guardar la tesis en la memoria.
            await this.memory.saveTradingThesis(thesis);
            console.log('[Scheduler] Nueva tesis de trading guardada con éxito.');

        } catch (error) {
            console.error('[Scheduler] Fallo en el análisis profundo:', error);
        }
    }
}

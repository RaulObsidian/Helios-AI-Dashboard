// server/AutonomousDirector.js

export class AutonomousDirector {
    constructor(heliosMemory, smartSelector) {
        this.memory = heliosMemory;
        this.selector = smartSelector;
        this.alerts = []; // Almacenamiento en memoria de las alertas activas
    }

    /**
     * Método principal que se ejecuta periódicamente para evaluar el estado del sistema.
     */
    async runDiagnostics() {
        console.log("Running Helios AI Director diagnostics...");
        this.alerts = []; // Limpiar alertas antiguas en cada ciclo

        await this._checkProviderHealth();
        // Aquí se añadirán más llamadas a otras comprobaciones de diagnóstico
    }

    /**
     * Comprueba la salud de todos los proveedores de datos.
     */
    async _checkProviderHealth() {
        if (!this.selector || !this.selector.providers) return;

        for (const providerId in this.selector.providers) {
            try {
                const provider = this.selector.providers[providerId];
                // Hacemos una llamada de prueba. El sistema de reintentos de BaseProvider se encargará.
                const data = await provider.fetch(); 
                if (data.price === 0) {
                    // Esto puede indicar una respuesta vacía (ej. CoinGecko)
                    throw new Error("Provider returned a price of 0, likely an empty response.");
                }
            } catch (error) {
                const errorMessage = `Connection failed for data provider: ${providerId}. Reason: ${error.message}`;
                this._generateAlert('PROVIDER_FAILURE', errorMessage, providerId);
                // Opcional: Loggear el evento en la base de datos
                this.memory.logEvent('ERROR', errorMessage, 'AutonomousDirector');
            }
        }
    }

    /**
     * Genera una nueva alerta y la añade a la lista.
     */
    _generateAlert(type, message, source) {
        const newAlert = {
            id: `${type}_${source}_${Date.now()}`,
            type: type, // 'PROVIDER_FAILURE', 'LOW_BALANCE', etc.
            message: message,
            recommendation: this._getRecommendationForAlert(type, source),
            timestamp: new Date().toISOString(),
        };
        this.alerts.push(newAlert);
    }

    /**
     * Devuelve una recomendación accionable basada en el tipo de alerta.
     */
    _getRecommendationForAlert(type, source) {
        switch (type) {
            case 'PROVIDER_FAILURE':
                return `Provider '${source}' is failing. It's recommended to switch to 'Automatic' mode or select a different provider in Settings to ensure stable market data.`;
            // Aquí se añadirán más recomendaciones para otros tipos de alertas
            default:
                return 'No specific recommendation available. Please check system logs.';
        }
    }

    /**
     * Devuelve la lista actual de alertas activas.
     */
    getAlerts() {
        return this.alerts;
    }
}

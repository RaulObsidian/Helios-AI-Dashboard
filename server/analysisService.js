// server/analysisService.js
import { sma } from 'technicalindicators';

/**
 * @class AnalysisService
 * @description Proporciona herramientas de análisis técnico para la IA.
 */
export class AnalysisService {
    constructor(heliosMemory) {
        this.memory = heliosMemory;
    }

    /**
     * Analiza los datos históricos para encontrar niveles clave de soporte y resistencia.
     * @param {Array<object>} ohlcvData - Array de datos de velas { open, high, low, close, volume, time }.
     * @returns {object} - Un objeto con los niveles encontrados y una explicación.
     */
    findSupportResistance(ohlcvData) {
        if (!ohlcvData || ohlcvData.length < 20) {
            return {
                explanation: "No hay suficientes datos históricos para realizar un análisis fiable.",
                drawings: []
            };
        }

        const closingPrices = ohlcvData.map(d => d.close);
        
        // Usamos una media móvil simple (SMA) de 20 periodos como base
        const sma20 = sma({ period: 20, values: closingPrices });

        // Un método simple para encontrar soportes/resistencias: buscar picos y valles.
        let supports = [];
        let resistances = [];

        for (let i = 2; i < ohlcvData.length - 2; i++) {
            const low = ohlcvData[i].low;
            const high = ohlcvData[i].high;

            // Pivote bajo (soporte)
            if (low < ohlcvData[i-1].low && low < ohlcvData[i-2].low && low < ohlcvData[i+1].low && low < ohlcvData[i+2].low) {
                supports.push(low);
            }

            // Pivote alto (resistencia)
            if (high > ohlcvData[i-1].high && high > ohlcvData[i-2].high && high > ohlcvData[i+1].high && high > ohlcvData[i+2].high) {
                resistances.push(high);
            }
        }

        // Simplificar y agrupar niveles cercanos (lógica a mejorar en el futuro)
        const mainSupport = Math.min(...supports);
        const mainResistance = Math.max(...resistances);

        const explanation = `Basado en el análisis de pivotes de las últimas ${ohlcvData.length} velas, se ha identificado un nivel de soporte principal alrededor de ${mainSupport.toFixed(4)} USDT y un nivel de resistencia clave cerca de ${mainResistance.toFixed(4)} USDT. La media móvil de 20 periodos se sitúa en ${sma20[sma20.length - 1].toFixed(4)} USDT, actuando como un nivel dinámico.`;

        const drawings = [
            { type: 'horizontal_line', price: mainSupport, color: '#00ff84', text: 'Soporte Principal' },
            { type: 'horizontal_line', price: mainResistance, color: '#ff4976', text: 'Resistencia Principal' },
        ];

        return { explanation, drawings };
    }
}

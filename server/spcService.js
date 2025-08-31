// server/spcService.js
import { execa } from 'execa';
import dotenv from 'dotenv';

dotenv.config();

const SPC_PATH = process.env.SPC_CLI_PATH;

if (!SPC_PATH) {
    throw new Error("La ruta al CLI de SPC no está definida. Por favor, crea un archivo .env en el directorio 'server' y añade la variable SPC_CLI_PATH.");
}

/**
 * Parsea una línea de texto para extraer un valor numérico usando una expresión regular.
 * Es robusto contra valores faltantes y formatos de número con comas.
 * @param {string} text - El texto completo donde buscar.
 * @param {RegExp} regex - La expresión regular para encontrar el valor.
 * @returns {number} - El valor parseado o 0 si no se encuentra.
 */
const parseNumericValue = (text, regex) => {
    const match = text.match(regex);
    // Si se encuentra el match, elimina comas y convierte a flotante.
    return match && match[1] ? parseFloat(match[1].replace(/,/g, '')) : 0;
};

/**
 * Obtiene y parsea el estado de la cartera y del host.
 * @returns {Promise<object>} - Un objeto con el estado de la cartera.
 */
export const getWalletAndHostState = async (apiPassword) => {
    try {
        const options = {
            env: { SPC_API_PASSWORD: apiPassword }
        };

        // Ejecutar ambos comandos en paralelo para máxima eficiencia.
        const [walletResult, hostResult] = await Promise.all([
            execa(SPC_PATH, ['wallet'], options),
            execa(SPC_PATH, ['host', '-v'], options) // -v para obtener detalles como el collateral
        ]);

        const walletText = walletResult.stdout;
        const hostText = hostResult.stdout;

        // Parsear datos financieros clave
        // Busca: "Confirmed Balance: 1,234.56 SCP"
        const confirmedBalance = parseNumericValue(walletText, /Confirmed Balance:\s+([\d,.]+) SCP/);
        // Busca: "Locked Collateral: 1,234.56 SCP"
        const lockedCollateral = parseNumericValue(hostText, /Locked Collateral:\s+([\d,.]+) SCP/);
        // Busca: "Storage Revenue: 1,234.56 SCP"
        const storageRevenue = parseNumericValue(hostText, /Storage Revenue:\s+([\d,.]+) SCP/);
        // Busca: "Download Revenue: 1,234.56 SCP"
        const downloadRevenue = parseNumericValue(hostText, /Download Revenue:\s+([\d,.]+) SCP/);
        // Busca: "Upload Revenue: 1,234.56 SCP"
        const uploadRevenue = parseNumericValue(hostText, /Upload Revenue:\s+([\d,.]+) SCP/);

        const nodeProfits = storageRevenue + downloadRevenue + uploadRevenue;
        const unlockedBalance = confirmedBalance - lockedCollateral;

        return {
            totalBalance: confirmedBalance,
            unlockedBalance: unlockedBalance > 0 ? unlockedBalance : 0,
            lockedCollateral: lockedCollateral,
            nodeProfits: nodeProfits,
            tradingProfits: 0, // Este dato no proviene del CLI.
        };
    } catch (error) {
        console.error('Error fetching wallet/host state:', error.stderr || error.message);
        // Propagar el error para que el controlador de la API lo maneje.
        throw new Error('Failed to execute or parse spc command for wallet/host state.');
    }
};

/**
 * Obtiene el estado general del host (altura de bloque, peers, etc.).
 * @returns {Promise<object>} - Un objeto con el estado del host.
 */
export const getHostStatus = async (apiPassword) => {
    try {
        const options = {
            env: { SPC_API_PASSWORD: apiPassword }
        };
        const { stdout } = await execa(SPC_PATH, [], options); // Sin el 'host'
        console.log("Salida de 'spc.exe host':", stdout); // <-- AÑADIMOS ESTO
        
        // Busca: "Height: 359404"
        const blockHeightMatch = stdout.match(/Height:\s+(\d+)/);
        // Busca: "Peers: 8"
        const peersMatch = stdout.match(/Peers:\s+(\d+)/);

        return {
            blockHeight: blockHeightMatch ? parseInt(blockHeightMatch[1], 10) : 0,
            peers: peersMatch ? parseInt(peersMatch[1], 10) : 0,
        };

    } catch (error) {
        console.error('Error fetching host status:', error.stderr || error.message);
        throw new Error('Failed to execute or parse spc command for host status.');
    }
};
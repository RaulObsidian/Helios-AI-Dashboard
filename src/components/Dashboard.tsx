import React from 'react';

// Importar todos los componentes necesarios UNA SOLA VEZ
import { WalletStatusCard } from './WalletStatusCard';
import NodeStatusCard from './NodeStatusCard';
import MarketDataCard from './MarketDataCard';
import TradingLogTable from './TradingLogTable';
import Chart from './Chart';

const Dashboard: React.FC = () => {
    // No necesita 't' directamente, ya que los componentes hijos lo usarán
    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Columna 1 y 2 para tarjetas */}
            <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 content-start">
                <div className="space-y-8">
                    <WalletStatusCard />
                    <MarketDataCard />
                </div>
                <div className="space-y-8">
                    <NodeStatusCard />
                    <TradingLogTable />
                </div>
            </div>

            {/* Columna 3 para el gráfico */}
            <div className="xl:col-span-1">
                <Chart />
            </div>
        </div>
    );
};

export default Dashboard;
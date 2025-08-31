import React from 'react';
import { AdvancedRealTimeChart, type Locales } from 'react-ts-tradingview-widgets';
import { useTranslation } from 'react-i18next';

const Chart: React.FC = () => {
    const { t, i18n } = useTranslation();

    return (
        <div className="bg-helios-gray rounded-lg shadow-lg p-6 flex flex-col h-[600px]">
            <div className="flex items-center text-helios-accent mb-4">
                {/* Icono podría ir aquí */}
                <h2 className="text-xl font-bold">{t('chart.title')}</h2>
            </div>
            <div className="flex-grow">
                <AdvancedRealTimeChart
                    theme="dark"
                    symbol="SCPUSDT" // Usaremos un símbolo común como placeholder
                    interval="60" // Intervalo de 60 minutos
                    timezone="Etc/UTC"
                    style="1"
                    locale={i18n.language as Locales}
                    autosize
                    hide_side_toolbar={false}
                    allow_symbol_change={true}
                    details={true}
                    hotlist={true}
                    calendar={true}
                />
            </div>
        </div>
    );
};

export default Chart;

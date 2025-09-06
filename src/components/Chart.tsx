import React from 'react';
import { AdvancedRealTimeChart } from 'react-ts-tradingview-widgets';
import { useTranslation } from 'react-i18next';
import { Panel } from './ui/Panel';

const Chart: React.FC = () => {
    const { t } = useTranslation();

    return (
        <Panel title={t('chart.title')}>
            <div className="h-[400px]">
                <AdvancedRealTimeChart
                    symbol="COINEX:SCPUSDT"
                    theme="dark"
                    autosize
                />
            </div>
        </Panel>
    );
};

export default Chart;

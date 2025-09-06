import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store';
import { Panel } from './ui/Panel';

const MetricRow: React.FC<{ label: string; value: React.ReactNode; }> = ({ label, value }) => (
    <div className="flex justify-between items-center text-sm">
        <span className="text-[var(--text-secondary)]">{label}</span>
        <span className="font-bold text-white">{value}</span>
    </div>
);

const NodeStatusCard: React.FC = () => {
    const { blockHeight, nodeConnectionStatus, nodeMetrics } = useAppStore();
    const { t } = useTranslation();

    const isConnected = nodeConnectionStatus === 'CONNECTED';

    return (
        <Panel title={t('nodeStatus.title')}>
            <div className="space-y-4">
                <MetricRow 
                    label={t('nodeStatus.status.title')} 
                    value={
                        <span className={isConnected ? 'text-green-400' : 'text-gray-400'}>
                            {t(`connection.status.${nodeConnectionStatus.toLowerCase()}`)}
                        </span>
                    }
                />
                <MetricRow 
                    label={t('nodeStatus.blockHeight')} 
                    value={isConnected && blockHeight ? blockHeight.toLocaleString() : t('common.loading')} 
                />
                <MetricRow 
                    label={t('nodeStatus.currentPrice')} 
                    value={`${nodeMetrics.priceScpTb} ${t('nodeStatus.unit')}`}
                />
                <MetricRow 
                    label={t('nodeStatus.suggestion')} 
                    value={`${nodeMetrics.suggestedPriceScpTb} ${t('nodeStatus.unit')}`}
                />
            </div>
        </Panel>
    );
};

export default NodeStatusCard;
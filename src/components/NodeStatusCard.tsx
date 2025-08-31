import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store';
import { ServerIcon } from './icons';

// Componente genérico de tarjeta
const Card: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; className?: string }> = ({ title, icon, children, className = '' }) => (
    <div className={`bg-helios-gray rounded-lg shadow-lg p-6 flex flex-col ${className}`}>
        <div className="flex items-center text-helios-accent mb-4">
            {icon}
            <h2 className="text-xl font-bold ml-3">{title}</h2>
        </div>
        <div className="flex-grow">{children}</div>
    </div>
);

// Componente para una fila de métricas
const MetricRow: React.FC<{ label: string; value: React.ReactNode; }> = ({ label, value }) => (
    <div className="flex justify-between items-center text-sm">
        <span className="text-gray-400">{label}</span>
        <span className="font-bold text-white">{value}</span>
    </div>
);

const NodeStatusCard: React.FC = () => {
    const blockHeight = useAppStore((state) => state.blockHeight);
    const nodeConnectionStatus = useAppStore((state) => state.nodeConnectionStatus);
    const { t } = useTranslation();

    const isConnected = nodeConnectionStatus === 'CONNECTED';

    return (
        <Card title={t('nodeStatus.title')} icon={<ServerIcon className="w-6 h-6" />}>
            <div className="space-y-4">
                <MetricRow 
                    label={t('nodeStatus.status.title')} 
                    value={
                        <span className={isConnected ? 'text-helios-green' : 'text-gray-400'}>
                            {t(`connection.status.${nodeConnectionStatus.toLowerCase()}`)}
                        </span>
                    }
                />
                <MetricRow 
                    label={t('nodeStatus.blockHeight')} 
                    value={isConnected && blockHeight ? blockHeight.toLocaleString() : t('common.loading')} 
                />
                {/* Los datos de abajo siguen siendo simulados por ahora */}
                <MetricRow 
                    label={t('nodeStatus.currentPrice')} 
                    value={`1500 ${t('nodeStatus.unit')}`}
                />
                <MetricRow 
                    label={t('nodeStatus.suggestion')} 
                    value={`1450 ${t('nodeStatus.unit')}`}
                />
            </div>
        </Card>
    );
};

export default NodeStatusCard;

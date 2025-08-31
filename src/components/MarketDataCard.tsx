import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store';
import { ChartBarIcon } from './icons';

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

const formatCurrency = (num: number) => `${(num / 1_000_000).toFixed(2)}M`;
const formatPrice = (num: number) => `${num.toFixed(4)}`;

const MarketDataCard: React.FC = () => {
    const { marketData, prevMarketData } = useAppStore();
    const { t } = useTranslation();

    if (!marketData) {
        return (
            <Card title={t('marketData.title')} icon={<ChartBarIcon className="w-6 h-6" />}>
                <p className="text-gray-400">{t('common.loading')}</p>
            </Card>
        );
    }

    const getDynamicColor = (current: number, prev: number | undefined) => {
        if (prev === undefined || current === prev) return 'text-white';
        return current > prev ? 'text-helios-green' : 'text-helios-red';
    };

    const priceColor = getDynamicColor(marketData.priceUSD, prevMarketData?.priceUSD);
    const mcapColor = getDynamicColor(marketData.marketCapUSD, prevMarketData?.marketCapUSD);
    const volumeColor = getDynamicColor(marketData.volume24hUSD, prevMarketData?.volume24hUSD);

    return (
        <Card title={t('marketData.title')} icon={<ChartBarIcon className="w-6 h-6" />}>
            <div className="space-y-5">
                <div className="text-center">
                    <p className="text-sm text-gray-400">{t('marketData.price')}</p>
                    <p className={`text-3xl font-bold ${priceColor}`}>{formatPrice(marketData.priceUSD)}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center text-sm">
                    <div>
                        <p className="text-gray-400">{t('marketData.mcap')}</p>
                        <p className={`font-semibold ${mcapColor}`}>{formatCurrency(marketData.marketCapUSD)}</p>
                    </div>
                    <div>
                        <p className="text-gray-400">{t('marketData.volume')}</p>
                        <p className={`font-semibold ${volumeColor}`}>{formatCurrency(marketData.volume24hUSD)}</p>
                    </div>
                </div>
                 <div className="text-center text-xs text-gray-500">
                    <span>{t('marketData.source')}: {marketData.provider}</span>
                </div>
            </div>
        </Card>
    );
};

export default MarketDataCard;

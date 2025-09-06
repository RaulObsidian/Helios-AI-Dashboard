import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store';
import { Panel } from './ui/Panel';

const formatCurrency = (num: number) => `${(num / 1_000_000).toFixed(2)}M`;
const formatPrice = (num: number) => `${num.toFixed(4)}`;

const MarketDataCard: React.FC = () => {
    const { marketData, prevMarketData, marketDataError } = useAppStore();
    const { t } = useTranslation();

    if (marketDataError) {
        return (
            <Panel title={t('marketData.title')}>
                <div className="text-center text-red-400">
                    <p className="font-bold">{t('marketData.errorTitle')}</p>
                    <p className="text-xs mt-2">{marketDataError}</p>
                    <p className="text-xs mt-2">{t('marketData.errorSuggestion')}</p>
                </div>
            </Panel>
        );
    }

    if (!marketData) {
        return (
            <Panel title={t('marketData.title')}>
                <p className="text-[var(--text-secondary)]">{t('common.loading')}</p>
            </Panel>
        );
    }

    const getDynamicColor = (current: number, prev: number | undefined) => {
        if (prev === undefined || current === prev) return 'text-white';
        return current > prev ? 'text-green-400' : 'text-red-400';
    };

    const priceColor = getDynamicColor(marketData.priceUSD, prevMarketData?.priceUSD);
    const mcapColor = getDynamicColor(marketData.marketCapUSD, prevMarketData?.marketCapUSD);
    const volumeColor = getDynamicColor(marketData.volume24hUSD, prevMarketData?.volume24hUSD);

    return (
        <Panel title={t('marketData.title')}>
            <div className="space-y-5">
                <div className="text-center">
                    <p className="text-sm text-[var(--text-secondary)]">{t('marketData.price')}</p>
                    <p className={`text-3xl font-bold ${priceColor}`}>{formatPrice(marketData.priceUSD)}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center text-sm">
                    {marketData.marketCapUSD > 0 && (
                        <div>
                            <p className="text-[var(--text-secondary)]">{t('marketData.mcap')}</p>
                            <p className={`font-semibold ${mcapColor}`}>{formatCurrency(marketData.marketCapUSD)}</p>
                        </div>
                    )}

                    <div>
                        <p className="text-[var(--text-secondary)]">{t('marketData.volume')}</p>
                        <p className={`font-semibold ${volumeColor}`}>{formatCurrency(marketData.volume24hUSD)}</p>
                    </div>
                </div>
                 <div className="text-center text-xs text-gray-500">
                    <span>{t('marketData.source')}: {marketData.provider}</span>
                </div>
            </div>
        </Panel>
    );
};

export default MarketDataCard;
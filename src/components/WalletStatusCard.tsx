import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store';
import { WalletIcon, LockClosedIcon } from './icons';
import { Panel } from './ui/Panel';

const formatNumber = (num: number) => num.toLocaleString(undefined, { maximumFractionDigits: 0 });

export const WalletStatusCard: React.FC = () => {
    const { walletState } = useAppStore();
    const { t } = useTranslation();
    const { totalBalance, unlockedBalance, lockedCollateral, nodeProfits, tradingProfits } = walletState;
    const totalProfits = nodeProfits + tradingProfits;
    const nodeProfitPercentage = totalProfits > 0 ? (nodeProfits / totalProfits) * 100 : 50;

    return (
        <Panel title={t('walletStatus.title')}>
            <div className="space-y-5">
                <div className="text-center">
                    <p className="text-sm text-[var(--text-secondary)]">{t('walletStatus.totalBalance')}</p>
                    <p className="text-3xl font-bold text-white">{formatNumber(totalBalance)} <span className="text-xl text-[var(--helios-accent)]">SCP</span></p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                        <p className="text-sm text-[var(--text-secondary)] flex items-center justify-center"><WalletIcon className="w-4 h-4 mr-1"/>{t('walletStatus.unlocked')}</p>
                        <p className="text-xl font-semibold text-green-400">{formatNumber(unlockedBalance)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-[var(--text-secondary)] flex items-center justify-center"><LockClosedIcon className="w-4 h-4 mr-1"/>{t('walletStatus.collateral')}</p>
                        <p className="text-xl font-semibold text-gray-300">{formatNumber(lockedCollateral)}</p>
                    </div>
                </div>

                <div>
                    <h4 className="text-sm text-[var(--text-secondary)] font-semibold mb-2 text-center">{t('walletStatus.profitBreakdown')}</h4>
                    <div className="w-full bg-[var(--background-main)] rounded-full h-4 overflow-hidden flex">
                        <div 
                            className="bg-[var(--helios-accent)] h-full"
                            style={{ width: `${nodeProfitPercentage}%` }}
                            title={`${t('walletStatus.nodeProfits')}: ${formatNumber(nodeProfits)} SCP`}
                        />
                        <div 
                            className="bg-green-400 h-full"
                            style={{ width: `${100 - nodeProfitPercentage}%` }}
                            title={`${t('walletStatus.tradingProfits')}: ${formatNumber(tradingProfits)} SCP`}
                        />
                    </div>
                    <div className="flex justify-between mt-1 text-xs">
                        <div className="flex items-center">
                            <span className="w-2 h-2 rounded-full bg-[var(--helios-accent)] mr-2"></span>
                            <span>{t('walletStatus.nodeProfits')}: {formatNumber(nodeProfits)}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="w-2 h-2 rounded-full bg-green-400 mr-2"></span>
                            <span>{t('walletStatus.tradingProfits')}: <span className={tradingProfits >= 0 ? 'text-green-400' : 'text-red-400'}>{formatNumber(tradingProfits)}</span></span>
                        </div>
                    </div>
                </div>
            </div>
        </Panel>
    );
};

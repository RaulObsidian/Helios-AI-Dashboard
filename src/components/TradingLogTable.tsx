import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store';
import { Panel } from './ui/Panel';

const TradingLogTable: React.FC = () => {
    const { tradingLog } = useAppStore();
    const { t } = useTranslation();

    return (
        <Panel title={t('tradingLog.title')}>
            <div className="overflow-x-auto -mx-6 -mb-6">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-[var(--text-secondary)] uppercase border-b border-[var(--border-color)]">
                        <tr>
                            <th scope="col" className="px-4 py-3">{t('tradingLog.header.time')}</th>
                            <th scope="col" className="px-4 py-3">{t('tradingLog.header.action')}</th>
                            <th scope="col" className="px-4 py-3 text-right">{t('tradingLog.header.amount')}</th>
                            <th scope="col" className="px-4 py-3 text-right">{t('tradingLog.header.price')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tradingLog.map((log) => (
                            <tr key={log.id} className="border-b border-[var(--border-color)] hover:bg-[var(--background-main)]">
                                <td className="px-4 py-3 text-gray-300">{new Date(log.timestamp).toLocaleTimeString()}</td>
                                <td className={`px-4 py-3 font-bold ${log.action === 'tradinglog.action.buy' ? 'text-green-400' : 'text-red-400'}`}>
                                    {t(`tradingLog.action.${log.action.split('.').pop()}`)}
                                </td>
                                <td className="px-4 py-3 text-right">{log.amountSCP.toLocaleString()}</td>
                                <td className="px-4 py-3 text-right">${log.priceUSD.toFixed(4)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Panel>
    );
};

export default TradingLogTable;

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store';
import { BookOpenIcon } from './icons';

const TradingLogTable: React.FC = () => {
    const { tradingLog } = useAppStore();
    const { t } = useTranslation();

    return (
        <div className="bg-helios-gray rounded-lg shadow-lg p-6 flex flex-col">
            <div className="flex items-center text-helios-accent mb-4">
                <BookOpenIcon className="w-6 h-6" />
                <h2 className="text-xl font-bold ml-3">{t('tradingLog.title')}</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-400 uppercase border-b border-gray-700">
                        <tr>
                            <th scope="col" className="px-4 py-3">{t('tradingLog.header.time')}</th>
                            <th scope="col" className="px-4 py-3">{t('tradingLog.header.action')}</th>
                            <th scope="col" className="px-4 py-3 text-right">{t('tradingLog.header.amount')}</th>
                            <th scope="col" className="px-4 py-3 text-right">{t('tradingLog.header.price')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tradingLog.map((log) => (
                            <tr key={log.id} className="border-b border-gray-700 hover:bg-gray-700">
                                <td className="px-4 py-3 text-gray-300">{new Date(log.timestamp).toLocaleTimeString()}</td>
                                <td className={`px-4 py-3 font-bold ${log.action === 'tradinglog.action.buy' ? 'text-helios-green' : 'text-helios-red'}`}>
                                    {t(`tradingLog.action.${log.action.split('.').pop()}`)}
                                </td>
                                <td className="px-4 py-3 text-right">{log.amountSCP.toLocaleString()}</td>
                                <td className="px-4 py-3 text-right">${log.priceUSD.toFixed(4)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TradingLogTable;
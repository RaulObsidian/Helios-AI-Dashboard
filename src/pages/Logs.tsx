import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store';
import { BookOpenIcon, ChatBubbleOvalLeftEllipsisIcon } from '../components/icons';

const TradingLogTable: React.FC = () => {
    const { tradingLog } = useAppStore();
    const { t } = useTranslation();

    return (
        <div className="bg-helios-gray rounded-lg shadow-lg p-6 flex flex-col">
            <div className="flex items-center text-helios-accent mb-4">
                <BookOpenIcon className="w-6 h-6" />
                <h2 className="text-xl font-bold ml-3">{t('tradingLog.title')}</h2>
            </div>
            <div className="overflow-y-auto h-96">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-400 uppercase border-b border-gray-700 sticky top-0 bg-helios-gray">
                        <tr>
                            <th scope="col" className="px-4 py-3">{t('tradingLog.header.time')}</th>
                            <th scope="col" className="px-4 py-3">{t('tradingLog.header.action')}</th>
                            <th scope="col" className="px-4 py-3 text-right">{t('tradingLog.header.amount')}</th>
                            <th scope="col" className="px-4 py-3 text-right">{t('tradingLog.header.price')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {tradingLog.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-700">
                                <td className="px-4 py-3 text-gray-300">{new Date(log.timestamp).toLocaleString()}</td>
                                <td className={`px-4 py-3 font-bold ${log.action === 'tradinglog.action.buy' ? 'text-helios-green' : 'text-helios-red'}`}>
                                    {t(log.action)}
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

const EventLogPanel: React.FC = () => {
    const { eventLog } = useAppStore();
    const { t } = useTranslation();

    return (
        <div className="bg-helios-gray rounded-lg shadow-lg p-6 flex flex-col">
            <div className="flex items-center text-helios-accent mb-4">
                <ChatBubbleOvalLeftEllipsisIcon className="w-6 h-6" />
                <h2 className="text-xl font-bold ml-3">{t('eventLog.title')}</h2>
            </div>
            <div className="overflow-y-auto h-96 bg-helios-dark rounded-md p-4 space-y-2 font-mono text-xs">
                {eventLog.map((event, index) => (
                    <p key={index} className="text-gray-300">
                        <span className="text-gray-500 mr-2">{`[${new Date().toLocaleTimeString()}]`}</span>
                        {event}
                    </p>
                ))}
            </div>
        </div>
    );
};


const Logs: React.FC = () => {
  return (
    <div className="space-y-8">
        <TradingLogTable />
        <EventLogPanel />
    </div>
  );
};

export default Logs;

// src/components/BotTerminalView.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store';
import { PlayIcon, StopIcon, CogIcon } from './icons';

export const BotTerminalView: React.FC<{ onConfigureClick: () => void }> = ({ onConfigureClick }) => {
    const { t } = useTranslation();
    const { botState, startBot, stopBot } = useAppStore();

    const isRunning = botState.state === 'RUNNING';

    // Función para renderizar la configuración de forma bonita
    const renderConfig = () => {
        if (!botState.config) {
            return <span className="text-gray-500">{t('botTerminal.noConfig')}</span>;
        }
        return (
            <pre className="text-sm whitespace-pre-wrap">
                {JSON.stringify(botState.config, null, 2)}
            </pre>
        );
    };

    return (
        <div className="bg-black border-4 border-gray-700 rounded-lg shadow-lg w-full aspect-video flex flex-col font-mono">
            {/* Barra de Título */}
            <div className="bg-gray-800 text-white py-2 px-4 flex items-center justify-between rounded-t-md">
                <span>C:\HeliosAI\Freqtrade_Terminal</span>
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            </div>

            {/* Contenido del Terminal */}
            <div className="p-4 text-white flex-grow overflow-y-auto text-base">
                <p><span className="text-helios-green">HeliosAI&gt;</span> GET_BOT_STATUS</p>
                <div className="pl-4">
                    <p>State: <span className={isRunning ? 'text-green-400' : 'text-red-400'}>{botState.state}</span></p>
                    <p>Strategy: <span className="text-cyan-400">{botState.strategy || 'N/A'}</span></p>
                    <p>Realized PNL: <span className="text-yellow-400">{botState.pnl.toFixed(4)} USDT</span></p>
                    <p>Open Orders: <span className="text-yellow-400">{botState.openOrders}</span></p>
                </div>
                <p className="mt-4"><span className="text-helios-green">HeliosAI&gt;</span> GET_ACTIVE_CONFIG</p>
                <div className="pl-4 bg-gray-900 rounded mt-1 p-2">
                    {renderConfig()}
                </div>
            </div>

            {/* Panel de Control */}
            <div className="bg-gray-800 p-2 flex items-center justify-end space-x-4 rounded-b-md">
                <button onClick={onConfigureClick} disabled={isRunning} className="btn btn-secondary disabled:opacity-50 flex items-center">
                    <CogIcon className="w-5 h-5 mr-2" />
                    {t('botTerminal.buttons.configure')}
                </button>
                <button onClick={startBot} disabled={isRunning} className="btn btn-success disabled:opacity-50 flex items-center">
                    <PlayIcon className="w-5 h-5 mr-2" />
                    {t('botTerminal.buttons.start')}
                </button>
                <button onClick={stopBot} disabled={!isRunning} className="btn btn-danger disabled:opacity-50 flex items-center">
                    <StopIcon className="w-5 h-5 mr-2" />
                    {t('botTerminal.buttons.stop')}
                </button>
            </div>
        </div>
    );
};

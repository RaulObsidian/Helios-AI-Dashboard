// src/components/TradingBotPanel.tsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store';
import { PlayIcon, StopIcon, CogIcon, SparklesIcon } from './icons';

// (Los componentes Section y NumberInput permanecen sin cambios)
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-helios-gray p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
        {children}
    </div>
);

const NumberInput: React.FC<{ label: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; step?: string; }> = ({ label, value, onChange, step = "0.001" }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300">{label}</label>
        <input
            type="number"
            value={value}
            onChange={onChange}
            step={step}
            className="mt-1 block w-full bg-helios-dark border border-gray-600 rounded-md px-3 py-2 text-sm focus:ring-helios-accent focus:border-helios-accent"
        />
    </div>
);


export const TradingBotPanel: React.FC = () => {
    const { t } = useTranslation();
    const { botState, fetchBotStatus, configureBot, startBot, stopBot } = useAppStore();
    
    const [config, setConfig] = useState({
        lowerPrice: 0.030,
        upperPrice: 0.050,
        gridSize: 10,
        investment: 1000,
    });

    // Sincronizar el estado del bot desde el store
    useEffect(() => {
        fetchBotStatus(); // Cargar el estado inicial
        const interval = setInterval(fetchBotStatus, 5000); // Actualizar cada 5 segundos
        return () => clearInterval(interval);
    }, [fetchBotStatus]);

    const handleConfigChange = (field: keyof typeof config) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfig(prev => ({ ...prev, [field]: parseFloat(e.target.value) }));
    };

    const handleConfigure = () => {
        configureBot(config);
    };

    const handleStart = () => {
        startBot();
    };

    const handleStop = () => {
        stopBot();
    };
    
    const handleProposeConfig = () => {
        console.log("Requesting config from Helios AI...");
        // TODO: Llamar a la API /api/trading/bot/propose-config
    };

    const isRunning = botState.state === 'RUNNING';

    return (
        <div className="space-y-8">
            <Section title={t('tradingBot.title')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Columna de Configuración */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-white">{t('tradingBot.config.title')}</h4>
                        <NumberInput label={t('tradingBot.config.lowerPrice')} value={config.lowerPrice} onChange={handleConfigChange('lowerPrice')} />
                        <NumberInput label={t('tradingBot.config.upperPrice')} value={config.upperPrice} onChange={handleConfigChange('upperPrice')} />
                        <NumberInput label={t('tradingBot.config.gridSize')} value={config.gridSize} onChange={handleConfigChange('gridSize')} step="1" />
                        <NumberInput label={t('tradingBot.config.investment')} value={config.investment} onChange={handleConfigChange('investment')} step="100" />
                        
                        <div className="flex items-center space-x-2 pt-4">
                            <button onClick={handleConfigure} disabled={isRunning} className="btn-secondary disabled:opacity-50 flex-1 flex items-center justify-center">
                                <CogIcon className="w-5 h-5 mr-2" />
                                {t('tradingBot.buttons.configure')}
                            </button>
                            <button onClick={handleProposeConfig} disabled={isRunning} className="btn-primary disabled:opacity-50 flex-1 flex items-center justify-center">
                                <SparklesIcon className="w-5 h-5 mr-2" />
                                {t('tradingBot.buttons.propose')}
                            </button>
                        </div>
                    </div>

                    {/* Columna de Estado y Control */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-white">{t('tradingBot.status.title')}</h4>
                        <div className="bg-helios-dark p-4 rounded-lg space-y-2">
                            <p>{t('tradingBot.status.state')}: <span className={`font-bold ${isRunning ? 'text-helios-green' : 'text-helios-red'}`}>{botState.state}</span></p>
                            <p>{t('tradingBot.status.pnl')}: <span className="font-bold">{botState.pnl.toFixed(2)} USDT</span></p>
                            <p>{t('tradingBot.status.openOrders')}: <span className="font-bold">{botState.openOrders}</span></p>
                        </div>
                        <div className="flex items-center space-x-2 pt-4">
                            <button onClick={handleStart} disabled={isRunning} className="btn-success disabled:opacity-50 flex-1 flex items-center justify-center">
                                <PlayIcon className="w-5 h-5 mr-2" />
                                {t('tradingBot.buttons.start')}
                            </button>
                            <button onClick={handleStop} disabled={!isRunning} className="btn-danger disabled:opacity-50 flex-1 flex items-center justify-center">
                                <StopIcon className="w-5 h-5 mr-2" />
                                {t('tradingBot.buttons.stop')}
                            </button>
                        </div>
                    </div>
                </div>
            </Section>
        </div>
    );
};

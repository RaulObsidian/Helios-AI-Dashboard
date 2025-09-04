// src/components/BotConfigModal.tsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store';
import { CogIcon, SparklesIcon, XIcon } from './icons';

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

export const BotConfigModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const { configureBot } = useAppStore();
    
    const [config, setConfig] = useState({
        strategy: 'GridStrategy',
        lowerPrice: 0.030,
        upperPrice: 0.050,
        gridSize: 20,
        investment: 1000,
    });

    const handleConfigChange = (field: keyof typeof config) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = field === 'gridSize' ? parseInt(e.target.value) : parseFloat(e.target.value);
        setConfig(prev => ({ ...prev, [field]: value }));
    };

    const handleProposeConfig = async () => {
        console.log("Requesting config from Helios AI...");
        try {
            const response = await fetch('http://localhost:3001/api/trading/bot/propose-config');
            if (!response.ok) throw new Error('Failed to get proposal');
            const proposedConfig = await response.json();
            setConfig(proposedConfig);
        } catch (error) {
            console.error("Error proposing config:", error);
            // TODO: Mostrar un toast de error al usuario
        }
    };

    const handleSave = () => {
        configureBot(config);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-helios-gray rounded-lg shadow-xl p-6 w-full max-w-md border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">{t('botConfigModal.title')}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="space-y-4">
                    <NumberInput label={t('botConfigModal.lowerPrice')} value={config.lowerPrice} onChange={handleConfigChange('lowerPrice')} />
                    <NumberInput label={t('botConfigModal.upperPrice')} value={config.upperPrice} onChange={handleConfigChange('upperPrice')} />
                    <NumberInput label={t('botConfigModal.gridSize')} value={config.gridSize} onChange={handleConfigChange('gridSize')} step="1" />
                    <NumberInput label={t('botConfigModal.investment')} value={config.investment} onChange={handleConfigChange('investment')} step="100" />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                    <button onClick={handleSave} className="btn btn-secondary flex-1 flex items-center justify-center">
                        <CogIcon className="w-5 h-5 mr-2" />
                        {t('botConfigModal.buttons.save')}
                    </button>
                    <button onClick={handleProposeConfig} className="btn btn-primary flex-1 flex items-center justify-center">
                        <SparklesIcon className="w-5 h-5 mr-2" />
                        {t('botConfigModal.buttons.propose')}
                    </button>
                </div>
            </div>
        </div>
    );
};

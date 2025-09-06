// src/components/BotConfigModal.tsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store';
import { CogIcon, SparklesIcon, XIcon } from './icons';
import { Panel } from './ui/Panel'; // Usamos nuestro nuevo Panel

// TODO: Crear componentes InputField y ActionButton reutilizables

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
    const [rationale, setRationale] = useState('');

    const handleConfigChange = (field: keyof typeof config) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = field === 'gridSize' ? parseInt(e.target.value) : parseFloat(e.target.value);
        setConfig(prev => ({ ...prev, [field]: value }));
    };

    const handleProposeConfig = async () => {
        console.log("Requesting thesis from Helios AI...");
        try {
            const response = await fetch('http://localhost:3001/api/trading/bot/latest-thesis');
            if (!response.ok) throw new Error('Failed to get latest thesis');
            const thesis = await response.json();
            setConfig(thesis.config);
            setRationale(thesis.rationale);
        } catch (error) {
            console.error("Error proposing config:", error);
            setRationale(t('botConfigModal.errors.thesis'));
        }
    };

    const handleSave = () => {
        configureBot(config);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <Panel title={t('botConfigModal.title')} className="w-full max-w-lg">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <XIcon className="w-6 h-6" />
                </button>
                <div className="space-y-4 mt-4">
                    {/* Inputs para configuración manual */}
                    {/* TODO: Reemplazar con InputField component */}
                    <input type="number" value={config.lowerPrice} onChange={handleConfigChange('lowerPrice')} placeholder={t('botConfigModal.lowerPrice')} className="w-full p-2 rounded bg-[var(--background-main)] border border-[var(--border-color)]" />
                    <input type="number" value={config.upperPrice} onChange={handleConfigChange('upperPrice')} placeholder={t('botConfigModal.upperPrice')} className="w-full p-2 rounded bg-[var(--background-main)] border border-[var(--border-color)]" />
                    <input type="number" value={config.gridSize} onChange={handleConfigChange('gridSize')} placeholder={t('botConfigModal.gridSize')} className="w-full p-2 rounded bg-[var(--background-main)] border border-[var(--border-color)]" />
                    <input type="number" value={config.investment} onChange={handleConfigChange('investment')} placeholder={t('botConfigModal.investment')} className="w-full p-2 rounded bg-[var(--background-main)] border border-[var(--border-color)]" />

                    {rationale && (
                        <div className="p-3 bg-[var(--background-main)] rounded-md border border-[var(--border-color)]">
                            <h4 className="font-bold text-[var(--helios-accent)]">{t('botConfigModal.rationaleTitle')}</h4>
                            <p className="text-sm mt-1">{rationale}</p>
                        </div>
                    )}
                </div>
                <div className="flex items-center space-x-4 pt-6">
                    <button onClick={handleSave} className="btn btn-secondary flex-1 flex items-center justify-center">
                        <CogIcon className="w-5 h-5 mr-2" />
                        {t('botConfigModal.buttons.save')}
                    </button>
                    <button onClick={handleProposeConfig} className="btn btn-primary flex-1 flex items-center justify-center">
                        <SparklesIcon className="w-5 h-5 mr-2" />
                        {t('botConfigModal.buttons.propose')}
                    </button>
                </div>
            </Panel>
        </div>
    );
};
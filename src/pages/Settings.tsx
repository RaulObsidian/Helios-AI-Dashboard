import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store';
import type { AppConfig } from '../types';
import { SetupType, NodeManagementStrategy, TradingStrategy, DataProvider } from '../types';
import React from 'react';

// Componente para una sección de configuración
const SettingsSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-helios-gray p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

// Componente para un control de formulario (ej: select)
const SelectControl: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: readonly string[]; t: (key: string) => string; translationPrefix?: string; }> = ({ label, value, onChange, options, t, translationPrefix }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300">{label}</label>
        <select 
            value={value} 
            onChange={onChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 bg-helios-dark focus:outline-none focus:ring-helios-accent focus:border-helios-accent sm:text-sm rounded-md"
        >
            {options.map(option => <option key={option} value={option}>{translationPrefix ? t(`${translationPrefix}.${option}`) : option}</option>)}
        </select>
    </div>
);


const Settings: React.FC = () => {
    const { config, updateConfig } = useAppStore();
    const { t } = useTranslation();

    const handleSelectChange = (key: keyof AppConfig) => (e: React.ChangeEvent<HTMLSelectElement>) => {
        updateConfig({ [key]: e.target.value as any });
    };
    
    const handleProviderChange = (provider: DataProvider) => {
        updateConfig({ priceProvider: provider });
    };

    const providerGroups = {
        CEX: [DataProvider.TRADEOGRE, DataProvider.KUCOIN, DataProvider.GATEIO],
        AGGREGATOR: [DataProvider.COINGECKO, DataProvider.COINPAPRIKA],
    };

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-white">{t('settings.title')}</h1>
            
            <SettingsSection title={t('settings.agent.title')}>
                <SelectControl 
                    label={t('settings.agent.profile')}
                    value={config.hardwareProfile}
                    onChange={handleSelectChange('hardwareProfile')}
                    options={Object.values(SetupType)}
                    t={t}
                    translationPrefix="enums.setupType"
                />
                <SelectControl 
                    label={t('settings.agent.nodeManagement')}
                    value={config.nodeManagementStrategy}
                    onChange={handleSelectChange('nodeManagementStrategy')}
                    options={Object.values(NodeManagementStrategy)}
                    t={t}
                    translationPrefix="enums.nodeManagementStrategy"
                />
                 <SelectControl 
                    label={t('settings.agent.strategy')}
                    value={config.tradingStrategy}
                    onChange={handleSelectChange('tradingStrategy')}
                    options={Object.values(TradingStrategy)}
                    t={t}
                    translationPrefix="enums.tradingStrategy"
                />
            </SettingsSection>

            <SettingsSection title={t('settings.data.title')}>
                 <div>
                    <label className="block text-sm font-medium text-gray-300">{t('settings.data.provider')}</label>
                    <div className="mt-2 space-y-4">
                        <div >
                            <h4 className="text-xs font-bold text-gray-400 uppercase">Automatic</h4>
                             <button 
                                onClick={() => handleProviderChange(DataProvider.AUTO)}
                                className={`w-full px-3 py-2 text-sm rounded-md transition-colors ${config.priceProvider === DataProvider.AUTO ? 'bg-helios-accent text-white' : 'bg-helios-dark hover:bg-gray-700'}`}
                            >
                                Helios AI SmartSelector
                            </button>
                        </div>
                        {Object.entries(providerGroups).map(([groupName, providers]) => (
                            <div key={groupName}>
                                <h4 className="text-xs font-bold text-gray-400 uppercase">{groupName}</h4>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {providers.map(provider => (
                                        <button 
                                            key={provider}
                                            onClick={() => handleProviderChange(provider)}
                                            className={`px-3 py-2 text-sm rounded-md transition-colors ${config.priceProvider === provider ? 'bg-helios-accent text-white' : 'bg-helios-dark hover:bg-gray-700'}`}
                                        >
                                            {provider}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </SettingsSection>
        </div>
    );
};

export default Settings;

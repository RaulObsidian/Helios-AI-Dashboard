import { ChevronDownIcon } from '../components/icons';
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
        <div className="mt-1 relative">
            <select 
                value={value} 
                onChange={onChange}
                className="appearance-none block w-full pl-3 pr-10 py-2 border border-gray-600 bg-helios-dark rounded-md focus:outline-none focus:ring-helios-accent focus:border-helios-accent sm:text-sm"
            >
                {options.map(option => <option key={option} value={option}>{translationPrefix ? t(`${translationPrefix}.${option}`) : option}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <ChevronDownIcon className="w-5 h-5" />
            </div>
        </div>
    </div>
);

const Settings: React.FC = () => {
    const { config, updateConfig } = useAppStore();
    const { t } = useTranslation();
    const [cmcKey, setCmcKey] = React.useState('');
    const [ccKey, setCcKey] = React.useState('');
    const [lcwKey, setLcwKey] = React.useState('');
    const [llmKey, setLlmKey] = React.useState('');
    // ... (otros estados para otras claves)

    const handleSelectChange = (key: keyof AppConfig) => (e: React.ChangeEvent<HTMLSelectElement>) => {
        updateConfig({ [key]: e.target.value as any });
    };
    
    const handleProviderChange = (provider: DataProvider | string) => {
        updateConfig({ priceProvider: provider as DataProvider });
    };

    const handleSaveApiKey = async (provider: string, apiKey: string, apiSecret?: string) => {
        try {
            const response = await fetch('http://localhost:3001/api/keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ provider, apiKey, apiSecret }),
            });
            if (!response.ok) throw new Error('Failed to save key');
            alert(`${provider} API Key saved successfully!`);
        } catch (error: any) {
            alert(`Error saving key: ${error.message}`);
        }
    };

    const providerGroups = {
        'Exchanges (CEX) - SCP Nativo (PoW)': [
            { name: 'CoinEx', type: 'CEX', usage: 'Trading, Heatmap L2, Ticker' },
            { name: 'TradeOgre', type: 'CEX', usage: 'Trading, Heatmap L2, Ticker' },
            { name: 'SouthXchange', type: 'CEX', usage: 'Ticker de respaldo' },
        ],
        'Agregadores de Datos (Global)': [
            { name: 'CoinGecko', type: 'Agregador', usage: 'Ticker robusto, Market Cap, i18n' },
            { name: 'CoinPaprika', type: 'Agregador', usage: 'Ticker robusto, alternativa rápida' },
            { name: 'CoinMarketCap', type: 'Agregador', usage: 'Estándar de la industria (Requiere API Key)' },
            { name: 'CryptoCompare', type: 'Agregador', usage: 'Datos históricos (Requiere API Key)' },
            { name: 'LiveCoinWatch', type: 'Agregador', usage: 'Ticker de respaldo (Requiere API Key)' },
        ],
        'Exchanges (DEX) y Seguimiento (SCP en Solana - SPL)': [
            { name: 'Jupiter', type: 'DEX Agg.', usage: 'Descubrimiento de precio en Solana' },
            { name: 'Birdeye', type: 'DEX Tracker', usage: 'Datos detallados de trading en Solana' },
        ]
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
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
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">{t('settings.data.provider')}</label>
                        <button 
                            onClick={() => handleProviderChange(DataProvider.AUTO)}
                            className={`w-full px-3 py-2 text-sm rounded-md transition-colors mb-4 ${config.priceProvider === DataProvider.AUTO ? 'bg-helios-accent text-white font-bold' : 'bg-helios-dark hover:bg-gray-700'}`}
                        >
                            Helios AI SmartSelector ({t('settings.data.automatic')})
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-helios-dark">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Proveedor</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tipo</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Uso Principal</th>
                                    <th scope="col" className="relative px-6 py-3">
                                        <span className="sr-only">Seleccionar</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-helios-gray">
                                {Object.entries(providerGroups).map(([groupName, providers]) => (
                                    <React.Fragment key={groupName}>
                                        <tr>
                                            <td colSpan={4} className="px-6 py-2 bg-helios-dark text-sm font-bold text-helios-accent">{groupName}</td>
                                        </tr>
                                        {providers.map((provider) => (
                                            <tr key={provider.name} className="border-b border-gray-700">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{provider.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{provider.type}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{provider.usage}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => handleProviderChange(provider.name as DataProvider)}
                                                        className={`px-3 py-1 text-xs rounded-full ${config.priceProvider === provider.name ? 'bg-helios-accent text-white' : 'bg-gray-600 hover:bg-gray-500'}`}
                                                    >
                                                        {config.priceProvider === provider.name ? 'Seleccionado' : 'Seleccionar'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SettingsSection>

            <SettingsSection title="Configuración de API Keys">
                <div className="space-y-4">
                    {/* CoinMarketCap */}
                    <div className="flex items-center space-x-4">
                        <label className="w-1/4 text-sm font-medium text-gray-300">CoinMarketCap API Key</label>
                        <input 
                            type="password" 
                            value={cmcKey}
                            onChange={(e) => setCmcKey(e.target.value)}
                            className="flex-grow bg-helios-dark border border-gray-600 rounded-md px-3 py-1 text-sm"
                        />
                        <button 
                            onClick={() => handleSaveApiKey('CoinMarketCap', cmcKey)}
                            className="bg-helios-accent hover:bg-blue-500 text-white font-bold py-1 px-4 rounded-md text-sm"
                        >
                            Guardar
                        </button>
                    </div>
                    {/* CryptoCompare */}
                    <div className="flex items-center space-x-4">
                        <label className="w-1/4 text-sm font-medium text-gray-300">CryptoCompare API Key</label>
                        <input 
                            type="password" 
                            value={ccKey}
                            onChange={(e) => setCcKey(e.target.value)}
                            className="flex-grow bg-helios-dark border border-gray-600 rounded-md px-3 py-1 text-sm"
                        />
                        <button 
                            onClick={() => handleSaveApiKey('CryptoCompare', ccKey)}
                            className="bg-helios-accent hover:bg-blue-500 text-white font-bold py-1 px-4 rounded-md text-sm"
                        >
                            Guardar
                        </button>
                    </div>
                    {/* LiveCoinWatch */}
                    <div className="flex items-center space-x-4">
                        <label className="w-1/4 text-sm font-medium text-gray-300">LiveCoinWatch API Key</label>
                        <input 
                            type="password" 
                            value={lcwKey}
                            onChange={(e) => setLcwKey(e.target.value)}
                            className="flex-grow bg-helios-dark border border-gray-600 rounded-md px-3 py-1 text-sm"
                        />
                        <button 
                            onClick={() => handleSaveApiKey('LiveCoinWatch', lcwKey)}
                            className="bg-helios-accent hover:bg-blue-500 text-white font-bold py-1 px-4 rounded-md text-sm"
                        >
                            Guardar
                        </button>
                    </div>
                    {/* LLM API Key */}
                    <div className="flex items-center space-x-4 pt-4 border-t border-gray-700">
                        <label className="w-1/4 text-sm font-medium text-helios-accent">LLM API Key (OpenAI/Google)</label>
                        <input 
                            type="password" 
                            value={llmKey}
                            onChange={(e) => setLlmKey(e.target.value)}
                            className="flex-grow bg-helios-dark border border-gray-600 rounded-md px-3 py-1 text-sm"
                        />
                        <button 
                            onClick={() => handleSaveApiKey('LLM', llmKey)}
                            className="bg-helios-accent hover:bg-blue-500 text-white font-bold py-1 px-4 rounded-md text-sm"
                        >
                            Guardar
                        </button>
                    </div>
                </div>
            </SettingsSection>
        </div>
    );
};

export default Settings;
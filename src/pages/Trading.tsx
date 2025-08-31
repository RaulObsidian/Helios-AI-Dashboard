import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store';
import type { TradingConnection } from '../types';
import { DataProvider, ConnectionStatus } from '../types';
import { KeyIcon, XCircleIcon } from '../components/icons';

// Componente para una sección
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-helios-gray p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

// Componente para el tutorial de API
const ApiTutorial: React.FC<{ t: (key: string) => string }> = ({ t }) => (
    <Section title={t('tradingPage.tutorial.title')}>
        <div className="text-sm text-gray-300 space-y-4">
            <p>{t('tradingPage.tutorial.intro')}</p>
            <div>
                <h4 className="font-bold text-white">{t('tradingPage.tutorial.security.title')}</h4>
                <ul className="list-disc list-inside mt-2 space-y-1">
                    <li><strong>{t('tradingPage.tutorial.security.item1')}</strong>: {t('tradingPage.tutorial.security.item1_body')}</li>
                    <li><strong>{t('tradingPage.tutorial.security.item2')}</strong>: {t('tradingPage.tutorial.security.item2_body')}</li>
                    <li><strong>{t('tradingPage.tutorial.security.item3')}</strong>: {t('tradingPage.tutorial.security.item3_body')}</li>
                </ul>
            </div>
            <div>
                <h4 className="font-bold text-white">{t('tradingPage.tutorial.howTo.title')}</h4>
                <p className="mt-1">{t('tradingPage.tutorial.howTo.intro')}</p>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>{t('tradingPage.tutorial.howTo.step1')}</li>
                    <li>{t('tradingPage.tutorial.howTo.step2')}</li>
                    <li>{t('tradingPage.tutorial.howTo.step3')}</li>
                    <li>{t('tradingPage.tutorial.howTo.step4')}</li>
                    <li>{t('tradingPage.tutorial.howTo.step5')}</li>
                    <li>{t('tradingPage.tutorial.howTo.step6')}</li>
                    <li>{t('tradingPage.tutorial.howTo.step7')}</li>
                    <li>{t('tradingPage.tutorial.howTo.step8')}</li>
                </ol>
            </div>
        </div>
    </Section>
);


const Trading: React.FC = () => {
    const { config, addTradingConnection, removeTradingConnection } = useAppStore();
    const { t } = useTranslation();
    
    const [newApiKey, setNewApiKey] = useState('');
    const [newApiSecret, setNewApiSecret] = useState('');
    const [selectedExchange, setSelectedExchange] = useState<DataProvider>(DataProvider.TRADEOGRE);

    const handleAddConnection = () => {
        if (newApiKey && newApiSecret) {
            const newConnection: TradingConnection = {
                id: `${selectedExchange}-${Date.now()}`,
                exchange: selectedExchange,
                apiKey: newApiKey,
                apiSecret: newApiSecret,
                status: ConnectionStatus.CONNECTED // Simulado
            };
            addTradingConnection(newConnection);
            setNewApiKey('');
            setNewApiSecret('');
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-8">
                <h1 className="text-3xl font-bold text-white">{t('tradingPage.title')}</h1>
                
                <Section title={t('tradingPage.connectionsTitle')}>
                    {/* Formulario para añadir nueva conexión */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <select 
                            value={selectedExchange}
                            onChange={(e) => setSelectedExchange(e.target.value as DataProvider)}
                            className="flex-1 mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 bg-helios-dark focus:outline-none focus:ring-helios-accent focus:border-helios-accent sm:text-sm rounded-md"
                        >
                            <option value={DataProvider.TRADEOGRE}>TradeOgre</option>
                            <option value={DataProvider.COINGECKO}>CoinGecko (Data Only)</option>
                            <option value={DataProvider.COINMARKETCAP}>CoinMarketCap (Data Only)</option>
                        </select>
                        <input type="text" placeholder={t('tradingPage.apiKeyPlaceholder')} value={newApiKey} onChange={e => setNewApiKey(e.target.value)} className="flex-2 input-style bg-helios-dark border border-gray-600 rounded-md px-3 py-1.5 text-sm" />
                        <input type="password" placeholder={t('tradingPage.apiSecretPlaceholder')} value={newApiSecret} onChange={e => setNewApiSecret(e.target.value)} className="flex-2 input-style bg-helios-dark border border-gray-600 rounded-md px-3 py-1.5 text-sm" />
                        <button onClick={handleAddConnection} className="bg-helios-accent hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-md text-sm">{t('tradingPage.addButton')}</button>
                    </div>

                    {/* Lista de conexiones existentes */}
                    <div className="space-y-3 mt-4">
                        {config.tradingConnections.map(conn => (
                            <div key={conn.id} className="flex items-center justify-between bg-helios-dark p-3 rounded-md">
                                <div className="flex items-center">
                                    <KeyIcon className="w-5 h-5 text-helios-accent mr-3"/>
                                    <div>
                                        <p className="font-bold">{conn.exchange}</p>
                                        <p className="text-xs text-gray-400">API Key: {conn.apiKey.substring(0, 8)}...</p>
                                    </div>
                                </div>
                                <button onClick={() => removeTradingConnection(conn.id)} className="text-gray-400 hover:text-white">
                                    <XCircleIcon className="w-6 h-6"/>
                                </button>
                            </div>
                        ))}
                    </div>
                </Section>
            </div>
            <div className="space-y-8">
                <ApiTutorial t={t} />
            </div>
        </div>
    );
};

export default Trading;

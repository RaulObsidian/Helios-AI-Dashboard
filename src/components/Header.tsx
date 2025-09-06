import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GlobeAltIcon, CheckCircleIcon, XCircleIcon } from './icons';
import { useAppStore } from '../store';
import { NotificationCenter } from './NotificationCenter';
import { supportedLngs } from '../i18n';
import { ConnectionStatus as ConnectionStatusEnum } from '../types';

const ConnectionStatus: React.FC = () => {
    const { nodeConnectionStatus } = useAppStore();
    const { t } = useTranslation();

    if (nodeConnectionStatus === 'CONNECTED') {
        return <div className="flex items-center text-sm text-helios-green"><CheckCircleIcon className="w-5 h-5 mr-2" /> {t('connection.status.connected')}</div>;
    }
    if (nodeConnectionStatus === 'FAILED') {
        return <div className="flex items-center text-sm text-helios-red"><XCircleIcon className="w-5 h-5 mr-2" /> {t('connection.status.failed')}</div>;
    }
    return <div className="flex items-center text-sm text-gray-400"><XCircleIcon className="w-5 h-5 mr-2" /> {t('connection.status.disconnected')}</div>;
}


const Header: React.FC = () => {
  const [password, setPassword] = useState('');
  const { nodeConnectionStatus, setNodeConnectionStatus, fetchWalletState, fetchHostState } = useAppStore();
  const { t, i18n } = useTranslation();

  const handleConnect = async () => {
    setNodeConnectionStatus(ConnectionStatusEnum.CONNECTING);
    try {
      const response = await fetch('http://localhost:3001/api/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        throw new Error('Connection failed');
      }
      // Si la conexión es exitosa, carga los datos inmediatamente
      await Promise.all([fetchHostState(), fetchWalletState()]);
    } catch (error) {
      console.error("Connection error:", error);
      setNodeConnectionStatus(ConnectionStatusEnum.FAILED);
    }
  };

  const handleDisconnect = () => {
    // Por ahora, simplemente resetea el estado.
    // Más adelante, podríamos tener un endpoint /api/disconnect en el backend.
    setNodeConnectionStatus(ConnectionStatusEnum.DISCONNECTED);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <header className="h-20 bg-helios-gray flex-shrink-0 flex items-center justify-between px-8 border-b border-gray-700">
      <div>
        <h2 className="text-2xl font-bold text-white">{t('nav.dashboard')}</h2>
      </div>
      <div className="flex items-center space-x-6">
        <ConnectionStatus />
        
        {nodeConnectionStatus !== 'CONNECTED' && (
            <div className="flex items-center space-x-2">
                <input 
                    type="password"
                    placeholder={t('connection.passwordPlaceholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-helios-dark border border-gray-600 rounded-md px-3 py-1 text-sm focus:ring-helios-accent focus:border-helios-accent"
                />
                <button 
                    onClick={handleConnect}
                    disabled={nodeConnectionStatus === 'CONNECTING'}
                    className="bg-helios-accent hover:bg-blue-500 text-white font-bold py-1 px-4 rounded-md text-sm disabled:opacity-50"
                >
                    {nodeConnectionStatus === 'CONNECTING' ? t('connection.connecting') : t('connection.connect')}
                </button>
            </div>
        )}
        {nodeConnectionStatus === 'CONNECTED' && (
             <button 
                onClick={handleDisconnect}
                className="bg-helios-red hover:bg-red-500 text-white font-bold py-1 px-4 rounded-md text-sm"
            >
                {t('connection.disconnect')}
            </button>
        )}

        <div className="flex items-center space-x-2">
          <GlobeAltIcon className="w-6 h-6 text-gray-400" />
          <select 
            value={i18n.language}
            onChange={handleLanguageChange}
            className="mt-1 block w-full pl-3 pr-10 py-1 text-base border-gray-600 bg-helios-dark text-white focus:outline-none focus:ring-helios-accent focus:border-helios-accent sm:text-sm rounded-md"
          >
            {Object.entries(supportedLngs).map(([code, name]) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </select>
        </div>
        <NotificationCenter />
      </div>
    </header>
  );
};

export default Header;

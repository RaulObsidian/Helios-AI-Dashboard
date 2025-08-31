import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GlobeAltIcon, CheckCircleIcon, XCircleIcon } from './icons';
import { useAppStore } from '../store';
import { mockApi } from '../services/mockApi';
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
  const { nodeConnectionStatus, setNodeConnectionStatus } = useAppStore();
  const { t, i18n } = useTranslation();

  const handleConnect = async () => {
    setNodeConnectionStatus(ConnectionStatusEnum.CONNECTING);
    await mockApi.connect(password);
  };

  const handleDisconnect = () => {
    mockApi.disconnect();
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
            className="bg-transparent text-white border-none focus:ring-0 cursor-pointer"
          >
            {Object.entries(supportedLngs).map(([code, name]) => (
              <option key={code} value={code} className="bg-helios-gray">{name}</option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
};

export default Header;

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BellIcon, XIcon } from './icons'; // Asumimos que XIcon existe o lo creamos
import { useAppStore } from '../store';
import type { Alert } from '../types';

const NotificationItem: React.FC<{ alert: Alert, onDismiss: (id: string) => void }> = ({ alert, onDismiss }) => (
    <div className="p-3 mb-2 bg-gray-700 rounded-md border-l-4 border-helios-red">
        <div className="flex justify-between items-start">
            <div>
                <p className="font-bold text-sm text-white">{alert.message}</p>
                <p className="text-xs text-gray-300 mt-1">{alert.recommendation}</p>
            </div>
            <button onClick={() => onDismiss(alert.id)} className="text-gray-400 hover:text-white">
                <XIcon className="w-4 h-4" />
            </button>
        </div>
    </div>
);

export const NotificationCenter: React.FC = () => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const { alerts, dismissAlert } = useAppStore();

    if (alerts.length === 0) {
        return (
            <div className="relative">
                <BellIcon className="w-6 h-6 text-gray-400" />
            </div>
        );
    }

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="relative">
                <BellIcon className="w-6 h-6 text-helios-accent animate-pulse" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-helios-red text-white text-xs flex items-center justify-center">
                        {alerts.length}
                    </span>
                </span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-helios-dark rounded-lg shadow-lg border border-gray-700 z-10">
                    <div className="p-3 border-b border-gray-700">
                        <h4 className="font-bold text-white">{t('header.alerts')}</h4>
                    </div>
                    <div className="p-2 max-h-80 overflow-y-auto">
                        {alerts.map(alert => (
                            <NotificationItem key={alert.id} alert={alert} onDismiss={dismissAlert} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

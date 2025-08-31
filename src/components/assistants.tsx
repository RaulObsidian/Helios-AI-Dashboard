import React, { useState } from 'react';
import type { ReactNode } from 'react';
import type { AppConfig } from '../types';
import { AdjustmentsHorizontalIcon, InformationCircleIcon } from './icons';

type Translator = (key: string) => string;

const Card: React.FC<{ title: string; icon: ReactNode; children: ReactNode; className?: string }> = ({ title, icon, children, className = '' }) => (
    <div className={`bg-helios-gray rounded-lg shadow-lg p-6 flex flex-col ${className}`}>
        <div className="flex items-center text-helios-accent mb-4">
            {icon}
            <h2 className="text-xl font-bold ml-3">{title}</h2>
        </div>
        <div className="flex-grow">{children}</div>
    </div>
);

const ConfirmationModal: React.FC<{ isOpen: boolean, onClose: () => void, onConfirm: () => void, t: Translator, enabling: boolean }> = ({ isOpen, onClose, onConfirm, t, enabling }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-helios-light-gray rounded-lg shadow-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4">{enabling ? t('assistants.modal.enable_title') : t('assistants.modal.disable_title')}</h3>
                <p className="text-gray-300 mb-6">{enabling ? t('assistants.modal.enable_body') : t('assistants.modal.disable_body')}</p>
                <div className="flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500">{t('assistants.modal.cancel')}</button>
                    <button onClick={onConfirm} className={`px-4 py-2 rounded text-white ${enabling ? 'bg-helios-accent hover:bg-blue-500' : 'bg-helios-red hover:bg-red-500'}`}>{t('assistants.modal.confirm')}</button>
                </div>
            </div>
        </div>
    );
};

export const AssistantManagerCard: React.FC<{
    config: AppConfig;
    setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
    t: Translator;
}> = ({ config, setConfig, t }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleToggle = () => {
        setIsModalOpen(true);
    };

    const handleConfirm = () => {
        setConfig(prev => ({ ...prev, supervisorLiteEnabled: !prev.supervisorLiteEnabled }));
        setIsModalOpen(false);
    };

    return (
        <>
            <Card title={t('assistants.title')} icon={<AdjustmentsHorizontalIcon className="w-6 h-6" />} className="col-span-1">
                <div className="space-y-4">
                    <div className="bg-helios-dark p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                            <h4 className="font-bold">Supervisor-lite</h4>
                            <div className={`text-xs font-semibold px-2 py-1 rounded-full ${config.supervisorLiteEnabled ? 'bg-helios-green/20 text-helios-green' : 'bg-gray-500/20 text-gray-400'}`}>
                                {config.supervisorLiteEnabled ? t('assistants.status.active') : t('assistants.status.inactive')}
                            </div>
                        </div>
                        <p className="text-sm text-gray-400 mt-2">{t('assistants.supervisor.description')}</p>
                        <div className="mt-4 flex items-center justify-between">
                             <span className="text-sm font-medium text-gray-300">{t('assistants.supervisor.enable')}</span>
                             <button
                                onClick={handleToggle}
                                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-helios-accent focus:ring-offset-helios-gray ${config.supervisorLiteEnabled ? 'bg-helios-green' : 'bg-gray-500'}`}
                                aria-checked={config.supervisorLiteEnabled}
                            >
                                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${config.supervisorLiteEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>
                     <div className="text-xs text-gray-500 flex items-start">
                        <InformationCircleIcon className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0"/>
                        <span>{t('assistants.info')}</span>
                    </div>
                </div>
            </Card>
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirm}
                t={t}
                enabling={!config.supervisorLiteEnabled}
            />
        </>
    );
};

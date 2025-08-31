import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store';
import type { AppConfig } from '../types';
import { SetupType, NodeManagementStrategy, TradingStrategy, DataProvider } from '../types';

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
        updateConfig({ [key]: e.target.value });
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
                 <SelectControl 
                    label={t('settings.data.provider')}
                    value={config.priceProvider}
                    onChange={handleSelectChange('priceProvider')}
                    options={Object.values(DataProvider)}
                    t={t}
                />
            </SettingsSection>
        </div>
    );
};

export default Settings;
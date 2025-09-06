import React from 'react';
import { NavLink as RouterNavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CpuChipIcon, ChartBarIcon, ScaleIcon, BookOpenIcon, CogIcon, ChartBarSquareIcon } from './icons';
import { APP_VERSION } from '../version';
import { SidebarChat } from './SidebarChat';

// Componente reutilizable para los enlaces de navegación, ahora usando el NavLink de react-router-dom
const NavLink: React.FC<{ icon: React.ReactNode; label: string; to: string }> = ({ icon, label, to }) => (
  <RouterNavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center px-4 py-3 text-lg rounded-lg transition-colors duration-200 ${
        isActive
          ? 'bg-helios-accent text-white font-bold'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      }`
    }
  >
    {icon}
    <span className="ml-4">{label}</span>
  </RouterNavLink>
);

const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  return (
    <aside className="w-64 bg-helios-gray flex-shrink-0 p-6 flex flex-col">
      <div className="flex items-center mb-10">
        <CpuChipIcon className="w-10 h-10 text-helios-accent" />
        <h1 className="text-2xl font-bold text-white ml-3">Helios AI</h1>
      </div>
      <nav className="flex-grow space-y-2">
        <NavLink icon={<ChartBarIcon className="w-6 h-6" />} label={t('nav.dashboard')} to="/" />
        <NavLink icon={<ScaleIcon className="w-6 h-6" />} label={t('nav.trading')} to="/trading" />
        <NavLink icon={<ChartBarSquareIcon className="w-6 h-6" />} label={t('nav.analysis')} to="/analysis" />
        <NavLink icon={<BookOpenIcon className="w-6 h-6" />} label={t('nav.logs')} to="/logs" />
        <NavLink icon={<CogIcon className="w-6 h-6" />} label={t('nav.settings')} to="/settings" />
      </nav>
      <div className="flex-shrink-0 h-80 relative">
        <SidebarChat />
      </div>
      <div className="text-xs text-gray-500 mt-4">
        <p>Version {APP_VERSION}</p>
        <p>&copy; 2025 Schmidt&Rueda</p>
      </div>
    </aside>
  );
};

export default Sidebar;
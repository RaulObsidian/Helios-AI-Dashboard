import React from 'react';
import { NavLink as RouterNavLink } from 'react-router-dom';
import { CpuChipIcon, ChartBarIcon, ScaleIcon, BookOpenIcon, CogIcon } from './icons';

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
  return (
    <aside className="w-64 bg-helios-gray flex-shrink-0 p-6 flex flex-col">
      <div className="flex items-center mb-10">
        <CpuChipIcon className="w-10 h-10 text-helios-accent" />
        <h1 className="text-2xl font-bold text-white ml-3">Helios AI</h1>
      </div>
      <nav className="flex-grow space-y-2">
        <NavLink icon={<ChartBarIcon className="w-6 h-6" />} label="Dashboard" to="/" />
        <NavLink icon={<ScaleIcon className="w-6 h-6" />} label="Trading" to="/trading" />
        <NavLink icon={<BookOpenIcon className="w-6 h-6" />} label="Logs" to="/logs" />
        <NavLink icon={<CogIcon className="w-6 h-6" />} label="Settings" to="/settings" />
      </nav>
      <div className="text-xs text-gray-500">
        <p>Version 0.2.0-beta</p>
        <p>&copy; 2025 Schmidt&Rueda</p>
      </div>
    </aside>
  );
};

export default Sidebar;

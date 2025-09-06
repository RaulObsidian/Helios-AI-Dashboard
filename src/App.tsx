import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppStore } from './store';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Trading from './pages/Trading';
import Logs from './pages/Logs';
import Settings from './pages/Settings';
import AnalysisCenter from './pages/AnalysisCenter';

function App() {
  const fetchHostState = useAppStore((state) => state.fetchHostState);
  const fetchWalletState = useAppStore((state) => state.fetchWalletState);
  const fetchNodeMetrics = useAppStore((state) => state.fetchNodeMetrics);
  const fetchMarketData = useAppStore((state) => state.fetchMarketData);
  const fetchAlerts = useAppStore((state) => state.fetchAlerts);
  const fetchBotStatus = useAppStore((state) => state.fetchBotStatus);

  useEffect(() => {
    const fetchData = () => {
      fetchHostState();
      fetchWalletState();
      fetchNodeMetrics();
      fetchMarketData();
      fetchAlerts();
      fetchBotStatus();
    };

    fetchData(); // Llama una vez al inicio
    const intervalId = setInterval(fetchData, 15000); // Y luego cada 15 segundos

    return () => clearInterval(intervalId);
  }, [fetchHostState, fetchWalletState, fetchNodeMetrics, fetchMarketData, fetchAlerts, fetchBotStatus]);

  return (
    <div className="flex h-screen bg-helios-dark text-gray-200 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-8 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/trading" element={<Trading />} />
            <Route path="/analysis" element={<AnalysisCenter />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App

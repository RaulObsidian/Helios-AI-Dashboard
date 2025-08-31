import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppStore } from './store';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Trading from './pages/Trading';
import Logs from './pages/Logs';
import Settings from './pages/Settings';

function App() {
  const fetchHostState = useAppStore((state) => state.fetchHostState);
  const fetchWalletState = useAppStore((state) => state.fetchWalletState);

  useEffect(() => {
    // Llama a las funciones una vez al inicio
    fetchHostState();
    fetchWalletState();

    // Configura un intervalo para llamar a ambas funciones cada 15 segundos
    const intervalId = setInterval(() => {
      fetchHostState();
      fetchWalletState();
    }, 15000);

    // Función de limpieza: se ejecuta cuando el componente se desmonta
    // para detener el intervalo y evitar fugas de memoria.
    return () => clearInterval(intervalId);
  }, [fetchHostState, fetchWalletState]);

  return (
    <div className="flex h-screen bg-helios-dark text-gray-200 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-8 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/trading" element={<Trading />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App

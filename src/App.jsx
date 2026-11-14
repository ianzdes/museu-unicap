import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Login } from './pages/Login';
import { Navbar } from './components/Navbar';
import { UserRegister } from './pages/management/users/UserRegister';
import { FilamentReport } from './pages/reports/filament/FilamentReport';
import { MachineUsage } from './pages/reports/usage/MachineUsage';
import { LoanHistory } from './pages/reports/loan/LoanHistory';
import { MaintenanceHistory } from './pages/reports/maintenance/MaintenanceHistory';
import { SupplyRegister } from './pages/patrimony/supply/SupplyRegister';
import { MachineRegister } from './pages/patrimony/machines/MachineRegister';
import { LoanRegister } from './pages/patrimony/loan/LoanRegister';
import { ClientRegister } from './pages/management/clients/ClientRegister';
import { UserSettings } from './pages/user/UserSettings';
import { ProductionReport } from './pages/reports/production/ProductionReport';
import { HomePage } from './pages/homepage/HomePage';
import { Footer } from './components/Footer';

function App() {
  const [session, setSession] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [currentRoute, setCurrentRoute] = useState('homepage');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoadingAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loadingAuth) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
        <p>Carregando sistema do museu...</p>
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  const renderContent = () => {
    if (currentRoute.startsWith('register:')) {
      const registerType = currentRoute.split(':')[1];

      switch (registerType) {
        case 'supplies':
          return <SupplyRegister />;

        case 'machines':
          return <MachineRegister />;

        case 'machine-loan':
          return <LoanRegister />;

        default:
          return <div>Cadastro não encontrado.</div>;
      }
    }

    if (currentRoute.startsWith('reports:')) {
      const reportType = currentRoute.split(':')[1];

      switch (reportType) {
        case 'filament-consumption':
          return <FilamentReport />;

        case 'machine-usage':
          return <MachineUsage />;

        case 'loan-history':
          return <LoanHistory />;

        case 'maintenance-history':
          return <MaintenanceHistory />;

        case 'production-report':
          return <ProductionReport />;

        default: 
          return <div>Relatório não encontrado.</div>;
      }
    }
    
    switch (currentRoute) {
      case 'users':
        return <UserRegister />;

      case 'clients':
        return <ClientRegister />;

      case 'user-settings':
        return <UserSettings />;

      case 'homepage':
        return <HomePage onNavigate={setCurrentRoute}/>;

      default:
        return <div>Página não encontrada</div>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
      <Navbar onNavigate={setCurrentRoute} />

      <main style={{ padding: '20px' }}>
        {renderContent()}
      </main>

      <Footer onNavigate={setCurrentRoute} />
    </div>
  );
}

export default App;
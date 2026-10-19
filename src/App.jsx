import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Login } from './pages/Login'; // Certifique-se de que o caminho do Login está correto
import { Navbar } from './components/Navbar';
import { UserRegister } from './components/UserRegister';
import { ContactPage } from './pages/ContactPage';
import { FilamentReport } from './pages/FilamentReportPage';
import { MachineUsage } from './pages/MachineUsage';
import { LoanHistory } from './pages/LoanHistory';
import { MaintenanceHistory } from './pages/MaintenanceHistory';
import { SupplyRegister } from './pages/SupplyRegister';
import { MachineRegister } from './pages/MachineRegister';
import { LoanRegister } from './pages/LoanRegister';

function App() {
  const [session, setSession] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [currentRoute, setCurrentRoute] = useState('users');

  useEffect(() => {
    // 1. Verifica se já existe uma sessão ativa ao carregar a página
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingAuth(false);
    });

    // 2. Fica escutando alterações de login/logout em tempo real
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoadingAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Mostra um estado de carregamento enquanto valida o login no Supabase
  if (loadingAuth) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
        <p>Carregando sistema do museu...</p>
      </div>
    );
  }

  // 3. Se não houver sessão ativa, trava o site inteiro e exibe a tela de Login
  if (!session) {
    return <Login />;
  }

  // Renderização das telas internas do sistema
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

        default: 
          return <div>Relatório não encontrado.</div>;
      }
    }
    
    switch (currentRoute) {
      case 'users':
        return <UserRegister />;

      case 'contacts':
        return <ContactPage />;

      default:
        return <div>Página não encontrada</div>;
    }
  };

  return (
    <div>
      <Navbar onNavigate={setCurrentRoute} />

      <main style={{ padding: '20px' }}>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
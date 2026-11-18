import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import { supabase } from './supabaseClient';
import styles from './App.module.css';
import { Login } from './pages/login/Login';
import { Navbar } from './components/navbar/Navbar';
import { Footer } from './components/footer/Footer';
import { HomePage } from './pages/homepage/HomePage';
import { UserRegister } from './pages/management/users/UserRegister';
import { ClientRegister } from './pages/management/clients/ClientRegister';
import { UserSettings } from './pages/user/UserSettings';
import { SupplyRegister } from './pages/patrimony/supply/SupplyRegister';
import { MachineRegister } from './pages/patrimony/machines/MachineRegister';
import { LoanRegister } from './pages/patrimony/loan/LoanRegister';
import { FilamentReport } from './pages/reports/filament/FilamentReport';
import { MachineUsage } from './pages/reports/usage/MachineUsage';
import { LoanHistory } from './pages/reports/loan/LoanHistory';
import { MaintenanceHistory } from './pages/reports/maintenance/MaintenanceHistory';
import { ProductionReport } from './pages/reports/production/ProductionReport';

function App() {
  // undefined = verificando a sessão | null = deslogado | objeto = logado
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return (
      <div className={styles.loading}>
        <p>Carregando sistema do museu...</p>
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <div className={styles.layout}>
        <Navbar />

        <main className={styles.main}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/usuarios" element={<UserRegister />} />
            <Route path="/clientes" element={<ClientRegister />} />
            <Route path="/preferencias" element={<UserSettings />} />

            <Route path="/cadastros/insumos" element={<SupplyRegister />} />
            <Route path="/cadastros/maquinas" element={<MachineRegister />} />
            <Route path="/cadastros/emprestimos" element={<LoanRegister />} />

            <Route path="/relatorios/consumo-de-filamentos" element={<FilamentReport />} />
            <Route path="/relatorios/uso-das-maquinas" element={<MachineUsage />} />
            <Route path="/relatorios/historico-de-emprestimos" element={<LoanHistory />} />
            <Route path="/relatorios/historico-de-manutencoes" element={<MaintenanceHistory />} />
            <Route path="/relatorios/historico-de-producao" element={<ProductionReport />} />

            <Route path="*" element={<div>Página não encontrada</div>} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
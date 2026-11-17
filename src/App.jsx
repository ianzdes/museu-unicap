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
            <Route path="/users" element={<UserRegister />} />
            <Route path="/clients" element={<ClientRegister />} />
            <Route path="/user-settings" element={<UserSettings />} />

            <Route path="/register/supplies" element={<SupplyRegister />} />
            <Route path="/register/machines" element={<MachineRegister />} />
            <Route path="/register/machine-loan" element={<LoanRegister />} />

            <Route path="/reports/filament-consumption" element={<FilamentReport />} />
            <Route path="/reports/machine-usage" element={<MachineUsage />} />
            <Route path="/reports/loan-history" element={<LoanHistory />} />
            <Route path="/reports/maintenance-history" element={<MaintenanceHistory />} />
            <Route path="/reports/production-report" element={<ProductionReport />} />

            <Route path="*" element={<div>Página não encontrada</div>} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { UserRegister } from './components/UserRegister';
import { ContactPage } from './pages/ContactPage';
import { FilamentReport } from './pages/FilamentReportPage';
import { MachineUsage } from './pages/MachineUsage';
import { LoanHistory } from './pages/LoanHistory';
import { MaintenanceHistory } from './pages/MaintenanceHistory';
import { SupplyRegister } from './pages/SupplyRegister';
import { MachineRegister } from './pages/MachineRegister';

function App() {

  const [currentRoute, setCurrentRoute] = useState('users');

  const renderContent = () => {

    if (currentRoute.startsWith('register:')) {
      const registerType = currentRoute.split(':')[1];

      switch (registerType) {
        case 'supplies':
          return <SupplyRegister />

        case 'machines':
          return <MachineRegister />

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
          return <div>Relatório não encontrado.</div>
      }
    }
    
    switch (currentRoute) {
      case 'users':
        return <UserRegister />;

      case 'contacts':
        return <ContactPage />;

      default:
        return <div>Relatório não encontrado</div>
    }
  };

  return (
    <div>
      <Navbar onNavigate={setCurrentRoute} />

      <main>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
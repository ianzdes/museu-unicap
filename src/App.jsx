import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { UserRegister } from './components/UserRegister';
import { ContactPage } from './pages/ContactPage';
import { MachinesPage } from './pages/MachinesPage';
import { FilamentReport } from './pages/FilamentReportPage';
import { MachineUsage } from './pages/MachineUsage';

function App() {

  const [currentRoute, setCurrentRoute] = useState('users');

  const renderContent = () => {

    if (currentRoute.startsWith('reports:')) {

      const reportType = currentRoute.split(':')[1];

      switch (reportType) {
        case 'filament-consumption':
          return <FilamentReport />;

        case 'machine-usage':
          return <MachineUsage />;

        default: 
          return <div>Relatório não encontrado</div>
      }
    }
    
    switch (currentRoute) {
      case 'users':
        return <UserRegister />;

      case 'contacts':
        return <ContactPage />;

      case 'machines':
        return <MachinesPage />;
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
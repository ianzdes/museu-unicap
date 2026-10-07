import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { UserRegister } from './components/UserRegister';
import { ContactPage } from './pages/ContactPage';
import { MachinesPage } from './pages/MachinesPage';
import { ReportsPage } from './pages/ReportsPage';

function App() {
  // estado pra controlar a tela atual, users ou contact

  const [currentPage, setCurrentPage] = useState('users');


  return (
    <div>
      {/* navbar vai ter a funcao setcurrentpage para alterar a tela */}
      <Navbar onNavigate={setCurrentPage}/>

      {/* conteudo principal */}
      <main style={{ padding: '20px' }}>
        {currentPage === 'users' && <UserRegister />}
        {currentPage === 'contact' && <ContactPage />}
        {currentPage === 'machines' && <MachinesPage />}
        {currentPage === 'reports' && <ReportsPage />}
      </main>
    </div>
  );
}

export default App;
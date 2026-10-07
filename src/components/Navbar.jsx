import { useState } from 'react';

export function Navbar({ onNavigate }) {

    const [isReportOpen, setIsReportOpen] = useState(false);

    const handleReportClick = (reportType) => {
        setIsReportOpen(false); // fecha dropdown
        onNavigate(`reports:${reportType}`) // envia a rota especifica do relatorio
    };
    
    return (
        <nav style={styles.nav}>
            <h1 style={styles.logo}>Museu</h1>
            <div style={styles.links}>
                <button onClick={() => onNavigate('users')} style={styles.navButton}>
                    Usuários
                </button>

                <button onClick={() => onNavigate('machines')} style={styles.navButton}>
                    Cadastro
                </button>

                {/* container do dropdown de relatorios */}
                <div 
                    style={styles.dropdownContainer}
                    onMouseEnter={() => setIsReportOpen(true)}
                    onMouseLeave={() => setIsReportOpen(false)}
                >
                    <button
                        onClick={() => onNavigate('reports')} // tirar depois a possibilidade de clicar nos relatorios em si, e só deixar a possibilidade de escolher as opcoes do dropdown
                        style={styles.navButton}
                    >
                        Relatórios
                    </button>

                    {/* caixinha do dropdown, {isReportOpen && (...)} é basicamente um if (isReportOpen == true...) */}

                    {isReportOpen && (

                        <div style={styles.dropdownMenu}>
                            <button 
                                onClick={() => handleReportClick('filament-consumption')}
                                className="dropdown-item-hover"
                                style={styles.dropdownItem}
                            >
                                Consumo de filamentos
                            </button>

                            <button
                                onClick={() => handleReportClick('machine-utilization')}
                                className="dropdown-item-hover"
                                style={styles.dropdownItem}
                            >
                                Uso das máquinas
                            </button>

                            <button
                                onClick={() => handleReportClick('loans')}
                                className="dropdown-item-hover"
                                style={styles.dropdownItem}
                            >
                                Histórico de empréstimos
                            </button>

                            <button
                                onClick={() => handleReportClick('maintenance')}
                                className="dropdown-item-hover"
                                style={styles.dropdownItem}
                            >
                                Manutenções
                            </button>

                        </div>
                    )}
                </div>

                <button onClick={() => onNavigate('contact')} style={styles.navButton}>
                    Contato
                </button>

            </div>
        </nav>
    );
}

// estilos rapidos em linha para o exemplo
const styles = {

    nav: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#690013', // #9d7628 e #690013 
        color: '#fff',
        padding: '15px 30px',
    },
    logo: { // nome museu
        margin: 0,
        fontSize: '1.2rem',
    },
    links: {
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
    },
    navButton: { // usuarios, contato, maquinas (do lado direito da logo museu)
        background: 'none',
        border: 'none',
        color: '#fff',
        fontSize: '16px',
        cursor: 'pointer',
        padding: '5px 10px',
    },
    dropdownContainer: {
        position: 'relative',
        display: 'inline-block',
    },
    dropdownMenu: {
        position: 'absolute',
        top: '100%',
        right: 0,
        backgroundColor: '#690013',
        border: '1px solid rgba(255, 255, 255, 0.15',
        borderRadius: '4px',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        minWidth: '200px',
        zIndex: 100,
        padding: '5px 0',
    },
    dropdownItem: {
        background: 'none',
        border: 'none',
        color: '#fff',
        fontSize: '14px',
        textAlign: 'left',
        padding: '10px 16px',
        cursor: 'pointer',
        width: '100%',
    },
};

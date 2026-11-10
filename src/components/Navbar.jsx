import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { UserSettings } from '../pages/UserSettings';

export function Navbar({ onNavigate }) {
    const [openDropdown, setOpenDropdown] = useState(null);
    const [userName, setUserName] = useState('Usuário');

    useEffect(() => {
        async function fetchUser() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const name = user.user_metadata?.name || user.email.split('@')[0];
                setUserName(name);
            }
        }
        fetchUser();
    }, []);

    const handleMenuClick = (route) => {
        onNavigate(route);
        setOpenDropdown(null);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    return (
        <nav style={styles.nav}>
            <div style={styles.logoContainer} onClick={() => onNavigate('home')} role="button">
                <h1 style={styles.logo}>Museu (logo)</h1>
            </div>

            <div style={styles.links}>
                <button style={styles.navButton} onClick={() => handleMenuClick('homepage')}>
                    Início
                </button>

                <div
                    style={styles.dropdownContainer}
                    onMouseEnter={() => setOpenDropdown('attendance')}
                    onMouseLeave={() => setOpenDropdown(null)}
                >
                    <button style={styles.navButton}>Gestão ▾</button>
                    {openDropdown === 'attendance' && (
                        <div style={styles.dropdownMenu}>
                            <button
                                onClick={() => handleMenuClick('users')}
                                style={styles.dropdownItem}
                            >
                                Usuários (Equipe)
                            </button>
                            <button
                                onClick={() => handleMenuClick('clients')}
                                style={styles.dropdownItem}
                            >
                                Clientes (Alunos/Visitantes)
                            </button>
                        </div>
                    )}
                </div>

                <div
                    style={styles.dropdownContainer}
                    onMouseEnter={() => setOpenDropdown('patrimony')}
                    onMouseLeave={() => setOpenDropdown(null)}
                >
                    <button style={styles.navButton}>Patrimônio ▾</button>
                    {openDropdown === 'patrimony' && (
                        <div style={styles.dropdownMenu}>
                            <button
                                onClick={() => handleMenuClick('register:machines')}
                                style={styles.dropdownItem}
                            >
                                Máquinas (3D / Scanners)
                            </button>
                            <button
                                onClick={() => handleMenuClick('register:machine-loan')}
                                style={styles.dropdownItem}
                            >
                                Equipamentos p/ Empréstimo
                            </button>
                            <button
                                onClick={() => handleMenuClick('register:supplies')}
                                style={styles.dropdownItem}
                            >
                                Suprimentos / Insumos
                            </button>
                        </div>
                    )}
                </div>

                <div 
                    style={styles.dropdownContainer}
                    onMouseEnter={() => setOpenDropdown('reports')}
                    onMouseLeave={() => setOpenDropdown(null)}
                >
                    <button style={styles.navButton}>Relatórios ▾</button>
                    {openDropdown === 'reports' && (
                        <div style={styles.dropdownMenu}>
                            <button 
                                onClick={() => handleMenuClick('reports:filament-consumption')}
                                style={styles.dropdownItem}
                            >
                                Consumo de Filamentos
                            </button>
                            <button
                                onClick={() => handleMenuClick('reports:machine-usage')}
                                style={styles.dropdownItem}
                            >
                                Uso das Máquinas
                            </button>
                            <button
                                onClick={() => handleMenuClick('reports:loan-history')}
                                style={styles.dropdownItem}
                            >
                                Histórico de Empréstimos
                            </button>
                            <button
                                onClick={() => handleMenuClick('reports:maintenance-history')}
                                style={styles.dropdownItem}
                            >
                                Manutenções
                            </button>
                        </div>
                    )}
                </div>

                <div 
                    style={styles.dropdownContainer}
                    onMouseEnter={() => setOpenDropdown('userMenu')}
                    onMouseLeave={() => setOpenDropdown(null)}
                >
                    <button style={styles.userNavButton}>
                        {userName} ▾
                    </button>
                    {openDropdown === 'userMenu' && (
                        <div style={styles.dropdownMenu}>
                            <button
                                onClick={() => handleMenuClick('user-settings')}
                                style={styles.dropdownItem}
                            >
                                Preferências
                            </button>
                            <button
                                onClick={handleLogout}
                                style={{ ...styles.dropdownItem, color: '#ffb3b3' }}
                            >
                                Sair (Logout)
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

const styles = {
    nav: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#690013', 
        color: '#fff',
        padding: '15px 30px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        fontFamily: 'sans-serif',
    },
    logoContainer: {
        cursor: 'pointer',
    },
    logo: {
        margin: 0,
        fontSize: '1.25rem',
        fontWeight: 'bold',
        letterSpacing: '0.5px',
    },
    links: {
        display: 'flex',
        gap: '15px',
        alignItems: 'center',
    },
    navButton: {
        background: 'none',
        border: 'none',
        color: '#fff',
        fontSize: '15px',
        fontWeight: '500',
        cursor: 'pointer',
        padding: '8px 12px',
        borderRadius: '4px',
        transition: 'background-color 0.2s',
    },
    userNavButton: {
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        color: '#fff',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        padding: '8px 14px',
        borderRadius: '6px',
        transition: 'background-color 0.2s',
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
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '6px',
        boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.35)',
        display: 'flex',
        flexDirection: 'column',
        minWidth: '200px',
        zIndex: 100,
        padding: '6px 0',
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
        fontWeight: 'normal',
    },
};

import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import styles from './Navbar.module.css';

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
        <nav className={styles.nav}>
            {/* Logo */}
            <div
                className={styles.logoContainer}
                onClick={() => onNavigate('home')}
                role="button"
            >
                <h1 className={styles.logo}>
                    Museu (logo)
                </h1>
            </div>

            {/* Links de navegação */}
            <div className={styles.links}>
                <button
                    className={styles.navButton}
                    onClick={() => handleMenuClick('homepage')}
                >
                    Início
                </button>

                {/* Gestão */}
                <div
                    className={styles.dropdownContainer}
                    onMouseEnter={() => setOpenDropdown('attendance')}
                    onMouseLeave={() => setOpenDropdown(null)}
                >
                    <button className={styles.navButton}>
                        Gestão ▾
                    </button>

                    {openDropdown === 'attendance' && (
                        <div className={styles.dropdownMenu}>
                            <button
                                onClick={() => handleMenuClick('users')}
                                className={styles.dropdownItem}
                            >
                                Usuários (Equipe)
                            </button>

                            <button
                                onClick={() => handleMenuClick('clients')}
                                className={styles.dropdownItem}
                            >
                                Clientes (Alunos/Visitantes)
                            </button>
                        </div>
                    )}
                </div>

                {/* Patrimônio */}
                <div
                    className={styles.dropdownContainer}
                    onMouseEnter={() => setOpenDropdown('patrimony')}
                    onMouseLeave={() => setOpenDropdown(null)}
                >
                    <button className={styles.navButton}>
                        Patrimônio ▾
                    </button>

                    {openDropdown === 'patrimony' && (
                        <div className={styles.dropdownMenu}>
                            <button
                                onClick={() => handleMenuClick('register:machines')}
                                className={styles.dropdownItem}
                            >
                                Máquinas (3D / Scanners)
                            </button>

                            <button
                                onClick={() => handleMenuClick('register:machine-loan')}
                                className={styles.dropdownItem}
                            >
                                Equipamentos para Empréstimo
                            </button>

                            <button
                                onClick={() => handleMenuClick('register:supplies')}
                                className={styles.dropdownItem}
                            >
                                Suprimentos e Insumos
                            </button>
                        </div>
                    )}
                </div>

                {/* Relatórios */}
                <div
                    className={styles.dropdownContainer}
                    onMouseEnter={() => setOpenDropdown('reports')}
                    onMouseLeave={() => setOpenDropdown(null)}
                >
                    <button className={styles.navButton}>
                        Relatórios ▾
                    </button>

                    {openDropdown === 'reports' && (
                        <div className={styles.dropdownMenu}>
                            <button
                                onClick={() => handleMenuClick('reports:filament-consumption')}
                                className={styles.dropdownItem}
                            >
                                Consumo de Filamentos
                            </button>

                            <button
                                onClick={() => handleMenuClick('reports:machine-usage')}
                                className={styles.dropdownItem}
                            >
                                Uso das Máquinas
                            </button>

                            <button
                                onClick={() => handleMenuClick('reports:loan-history')}
                                className={styles.dropdownItem}
                            >
                                Histórico de Empréstimos
                            </button>

                            <button
                                onClick={() => handleMenuClick('reports:maintenance-history')}
                                className={styles.dropdownItem}
                            >
                                Histórico de Manutenções
                            </button>

                            <button
                                onClick={() => handleMenuClick('reports:production-report')}
                                className={styles.dropdownItem}
                            >
                                Histórico de produção
                            </button>
                        </div>
                    )}
                </div>

                {/* Menu do usuário */}
                <div
                    className={styles.dropdownContainer}
                    onMouseEnter={() => setOpenDropdown('userMenu')}
                    onMouseLeave={() => setOpenDropdown(null)}
                >
                    <button className={styles.userNavButton}>
                        {userName} ▾
                    </button>

                    {openDropdown === 'userMenu' && (
                        <div className={styles.dropdownMenu}>
                            <button
                                onClick={() => handleMenuClick('user-settings')}
                                className={styles.dropdownItem}
                            >
                                Preferências
                            </button>

                            <button
                                onClick={handleLogout}
                                className={`${styles.dropdownItem} ${styles.logoutItem}`}
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

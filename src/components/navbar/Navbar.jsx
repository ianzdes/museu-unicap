import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { supabase } from '../../supabaseClient';
import styles from './Navbar.module.css';

// Menus suspensos. Para criar um item novo, basta adicionar uma linha aqui.
const MENUS = [
    {
        id: 'management',
        label: 'Gestão',
        items: [
            { to: '/users', label: 'Usuários (Equipe)' },
            { to: '/clients', label: 'Clientes (Alunos/Visitantes)' },
        ],
    },
    {
        id: 'patrimony',
        label: 'Patrimônio',
        items: [
            { to: '/register/machines', label: 'Máquinas (3D / Scanners)' },
            { to: '/register/machine-loan', label: 'Equipamentos para Empréstimo' },
            { to: '/register/supplies', label: 'Suprimentos e Insumos' },
        ],
    },
    {
        id: 'reports',
        label: 'Relatórios',
        items: [
            { to: '/reports/filament-consumption', label: 'Consumo de Filamentos' },
            { to: '/reports/machine-usage', label: 'Uso das Máquinas' },
            { to: '/reports/loan-history', label: 'Histórico de Empréstimos' },
            { to: '/reports/maintenance-history', label: 'Histórico de Manutenções' },
            { to: '/reports/production-report', label: 'Histórico de Produção' },
        ],
    },
];

export function Navbar() {
    const navigate = useNavigate();
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

    const closeMenu = () => setOpenDropdown(null);

    // Abre o menu ao passar o mouse e fecha ao sair
    const hoverProps = (id) => ({
        onMouseEnter: () => setOpenDropdown(id),
        onMouseLeave: closeMenu,
    });

    // Ao sair, a tela de login aparece sozinha (o App percebe que não há mais sessão)
    const handleLogout = async () => {
        navigate('/');
        await supabase.auth.signOut();
    };

    return (
        <nav className={styles.nav}>
            {/* Logo */}
            <Link to="/" className={styles.logoContainer}>
                <h1 className={styles.logo}>
                    Museu (logo)
                </h1>
            </Link>

            {/* Links de navegação */}
            <div className={styles.links}>
                <Link to="/" className={styles.navButton}>
                    Início
                </Link>

                {MENUS.map((menu) => (
                    <div key={menu.id} className={styles.dropdownContainer} {...hoverProps(menu.id)}>
                        <button className={styles.navButton}>
                            {menu.label} ▾
                        </button>

                        {openDropdown === menu.id && (
                            <div className={styles.dropdownMenu}>
                                {menu.items.map((item) => (
                                    <Link
                                        key={item.to}
                                        to={item.to}
                                        onClick={closeMenu}
                                        className={styles.dropdownItem}
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                {/* Menu do usuário */}
                <div className={styles.dropdownContainer} {...hoverProps('userMenu')}>
                    <button className={styles.userNavButton}>
                        {userName} ▾
                    </button>

                    {openDropdown === 'userMenu' && (
                        <div className={styles.dropdownMenu}>
                            <Link
                                to="/user-settings"
                                onClick={closeMenu}
                                className={styles.dropdownItem}
                            >
                                Preferências
                            </Link>

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
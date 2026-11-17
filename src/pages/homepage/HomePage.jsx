import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { supabase } from '../../supabaseClient';
import styles from './HomePage.module.css';

// Cards de "Acesso Rápido". Para criar um atalho novo, basta adicionar uma linha aqui.
const QUICK_ACCESS = [
    {
        title: 'Atendimento & Pessoas',
        links: [
            { to: '/users', label: 'Gerenciar Usuários →' },
            { to: '/clients', label: 'Gerenciar Clientes →' },
        ],
    },
    {
        title: 'Patrimônio & Estoque',
        links: [
            { to: '/register/machines', label: 'Máquinas 3D e Scanners →' },
            { to: '/register/machine-loan', label: 'Equipamentos para Empréstimos →' },
            { to: '/register/supplies', label: 'Estoque de Filamentos & Resinas →' },
        ],
    },
    {
        title: 'Relatórios & Históricos',
        links: [
            { to: '/reports/filament-consumption', label: 'Consumo de filamentos →' },
            { to: '/reports/machine-usage', label: 'Uso das Máquinas →' },
            { to: '/reports/loan-history', label: 'Histórico de Empréstimos →' },
            { to: '/reports/maintenance-history', label: 'Histórico de Manutenções →' },
            { to: '/reports/production-report', label: 'Relatório de Produção →' },
        ],
    },
];

export function HomePage() {
    const [stats, setStats] = useState({
        users: 0,
        clients: 0,
        equipments: 0,
        activeLoans: 0,
        lowStockSupplies: 0
    });
    const [userName, setUserName] = useState('Colaborador');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                setLoading(true);

                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const name = user.user_metadata?.name || user.email.split('@')[0];
                    setUserName(name);
                }

                const [
                    usersRes,
                    clientsRes,
                    equipmentsRes,
                    loansRes,
                    suppliesRes
                ] = await Promise.all([
                    supabase.from('profiles').select('*', { count: 'exact', head: true }),
                    supabase.from('clients').select('*', { count: 'exact', head: true }),
                    supabase.from('equipments').select('*', { count: 'exact', head: true }),
                    supabase.from('loans').select('*', { count: 'exact', head: true }).eq('status', 'Ativo'),
                    supabase.from('supplies').select('*').lte('current_stock_grams', 200)
                ]);

                setStats({
                    users: usersRes.count || 0,
                    clients: clientsRes.count || 0,
                    equipments: equipmentsRes.count || 0,
                    activeLoans: loansRes.count || 0,
                    lowStockSupplies: suppliesRes.data?.length || 0
                });
            } catch (err) {
                console.error('Erro ao carregar dados do dashboard:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchDashboardData();
    }, []);

    const hasActiveLoans = stats.activeLoans > 0;
    const hasLowStock = stats.lowStockSupplies > 0;

    return (
        <div className={styles.container}>
            <div className={styles.heroBanner}>
                <div>
                    <span className={styles.miniCategory}>SISTEMA INTEGRADO DE GESTÃO</span>
                    <h1 className={styles.heroTitle}>Olá, {userName}!</h1>
                    <p className={styles.heroSubtitle}>
                        Visão geral do acervo, laboratório maker, empréstimos ativos e controle de insumos do museu.
                    </p>
                </div>
            </div>

            <div className={styles.metricsGrid}>
                <Link to="/users" className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <span className={styles.metricTrend}>Equipe</span>
                    </div>
                    <span className={styles.metricValue}>{loading ? '...' : stats.users}</span>
                    <span className={styles.metricLabel}>Usuários Cadastrados</span>
                </Link>

                <Link to="/clients" className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <span className={styles.metricTrend}>Visitantes</span>
                    </div>
                    <span className={styles.metricValue}>{loading ? '...' : stats.clients}</span>
                    <span className={styles.metricLabel}>Clientes / Alunos</span>
                </Link>

                <Link to="/register/machines" className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <span className={styles.metricTrend}>Patrimônio</span>
                    </div>
                    <span className={styles.metricValue}>{loading ? '...' : stats.equipments}</span>
                    <span className={styles.metricLabel}>Máquinas & Equipamentos</span>
                </Link>

                <Link to="/register/machine-loan" className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <span className={`${styles.metricTrend} ${hasActiveLoans ? styles.trendDanger : styles.trendSuccess}`}>
                            {hasActiveLoans ? 'Em andamento' : 'Regular'}
                        </span>
                    </div>
                    <span className={styles.metricValue}>{loading ? '...' : stats.activeLoans}</span>
                    <span className={styles.metricLabel}>Empréstimos Ativos</span>
                </Link>

                <Link to="/register/supplies" className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <span className={`${styles.metricTrend} ${hasLowStock ? styles.trendDanger : styles.trendSuccess}`}>
                            {hasLowStock ? 'Atenção' : 'OK'}
                        </span>
                    </div>
                    <span className={`${styles.metricValue} ${hasLowStock ? styles.valueDanger : ''}`}>
                        {loading ? '...' : stats.lowStockSupplies}
                    </span>
                    <span className={styles.metricLabel}>Insumos c/ Estoque Baixo</span>
                </Link>
            </div>

            <h3 className={styles.sectionTitle}>Acesso Rápido</h3>

            <div className={styles.modulesGrid}>
                {QUICK_ACCESS.map((module) => (
                    <div key={module.title} className={styles.moduleBox}>
                        <div className={styles.moduleHeader}>
                            <h4 className={styles.moduleTitle}>{module.title}</h4>
                        </div>
                        <div className={styles.moduleLinks}>
                            {module.links.map((link) => (
                                <Link key={link.to} to={link.to} className={styles.moduleButton}>
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
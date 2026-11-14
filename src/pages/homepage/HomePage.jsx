import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import styles from './HomePage.module.css';

export function HomePage({ onNavigate }) {
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
                <div className={styles.metricCard} onClick={() => onNavigate('users')} role="button">
                    <div className={styles.metricHeader}>
                        <span className={styles.metricTrend}>Equipe</span>
                    </div>
                    <span className={styles.metricValue}>{loading ? '...' : stats.users}</span>
                    <span className={styles.metricLabel}>Usuários Cadastrados</span>
                </div>

                <div className={styles.metricCard} onClick={() => onNavigate('clients')} role="button">
                    <div className={styles.metricHeader}>
                        <span className={styles.metricTrend}>Visitantes</span>
                    </div>
                    <span className={styles.metricValue}>{loading ? '...' : stats.clients}</span>
                    <span className={styles.metricLabel}>Clientes / Alunos</span>
                </div>

                <div className={styles.metricCard} onClick={() => onNavigate('register:machines')} role="button">
                    <div className={styles.metricHeader}>
                        <span className={styles.metricTrend}>Patrimônio</span>
                    </div>
                    <span className={styles.metricValue}>{loading ? '...' : stats.equipments}</span>
                    <span className={styles.metricLabel}>Máquinas & Equipamentos</span>
                </div>

                <div className={styles.metricCard} onClick={() => onNavigate('register:machine-loan')} role="button">
                    <div className={styles.metricHeader}>
                        <span className={`${styles.metricTrend} ${hasActiveLoans ? styles.trendDanger : styles.trendSuccess}`}>
                            {hasActiveLoans ? 'Em andamento' : 'Regular'}
                        </span>
                    </div>
                    <span className={styles.metricValue}>{loading ? '...' : stats.activeLoans}</span>
                    <span className={styles.metricLabel}>Empréstimos Ativos</span>
                </div>

                <div className={styles.metricCard} onClick={() => onNavigate('register:supplies')} role="button">
                    <div className={styles.metricHeader}>
                        <span className={`${styles.metricTrend} ${hasLowStock ? styles.trendDanger : styles.trendSuccess}`}>
                            {hasLowStock ? 'Atenção' : 'OK'}
                        </span>
                    </div>
                    <span className={`${styles.metricValue} ${hasLowStock ? styles.valueDanger : ''}`}>
                        {loading ? '...' : stats.lowStockSupplies}
                    </span>
                    <span className={styles.metricLabel}>Insumos c/ Estoque Baixo</span>
                </div>
            </div>

            <h3 className={styles.sectionTitle}>Acesso Rápido</h3>

            <div className={styles.modulesGrid}>
                <div className={styles.moduleBox}>
                    <div className={styles.moduleHeader}>
                        <h4 className={styles.moduleTitle}>Atendimento & Pessoas</h4>
                    </div>
                    <div className={styles.moduleLinks}>
                        <button className={styles.moduleButton} onClick={() => onNavigate('users')}>
                            Gerenciar Usuários →
                        </button>
                        <button className={styles.moduleButton} onClick={() => onNavigate('clients')}>
                            Gerenciar Clientes →
                        </button>
                    </div>
                </div>

                <div className={styles.moduleBox}>
                    <div className={styles.moduleHeader}>
                        <h4 className={styles.moduleTitle}>Patrimônio & Estoque</h4>
                    </div>
                    <div className={styles.moduleLinks}>
                        <button className={styles.moduleButton} onClick={() => onNavigate('register:machines')}>
                            Máquinas 3D e Scanners →
                        </button>
                        <button className={styles.moduleButton} onClick={() => onNavigate('register:machine-loan')}>
                            Equipamentos para Empréstimos →
                        </button>
                        <button className={styles.moduleButton} onClick={() => onNavigate('register:supplies')}>
                            Estoque de Filamentos & Resinas →
                        </button>
                    </div>
                </div>

                <div className={styles.moduleBox}>
                    <div className={styles.moduleHeader}>
                        <h4 className={styles.moduleTitle}>Relatórios & Históricos</h4>
                    </div>
                    <div className={styles.moduleLinks}>
                        <button className={styles.moduleButton} onClick={() => onNavigate('reports:filament-consumption')}>
                            Consumo de filamentos →
                        </button>
                        <button className={styles.moduleButton} onClick={() => onNavigate('reports:machine-usage')}>
                            Uso das Máquinas →
                        </button>
                        <button className={styles.moduleButton} onClick={() => onNavigate('reports:maintenance-history')}>
                            Histórico de Empréstimos →
                        </button>
                        <button className={styles.moduleButton} onClick={() => onNavigate('reports:maintenance-history')}>
                            Histórico de Manutenções →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
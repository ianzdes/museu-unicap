import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { styles } from '../styles/reportStyles';

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

    // Busca contagens reais e dados do usuário logado no Supabase
    useEffect(() => {
        async function fetchDashboardData() {
            try {
                setLoading(true);
                
                // Busca nome do usuário atual
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const name = user.user_metadata?.name || user.email.split('@')[0];
                    setUserName(name);
                }

                // Consultas paralelas no Supabase para montar o dashboard
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

    return (
        <div style={styles.container}>
            {/* 1. Banner Superior de Boas-Vindas */}
            <div style={dashStyles.heroBanner}>
                <div>
                    <span style={styles.miniCategory}>SISTEMA INTEGRADO DE GESTÃO</span>
                    <h1 style={dashStyles.heroTitle}>Olá, {userName}! </h1>
                    <p style={dashStyles.heroSubtitle}>
                        Visão geral do acervo, laboratório maker, empréstimos ativos e controle de insumos do museu.
                    </p>
                </div>
            </div>

            {/* 2. Grid de Indicadores Principais (Cards Estilo Dashboard) */}
            <div style={dashStyles.metricsGrid}>
                <div style={dashStyles.metricCard} onClick={() => onNavigate('users')} role="button">
                    <div style={dashStyles.metricHeader}>
                        <span style={dashStyles.metricTrend}>Equipe</span>
                    </div>
                    <span style={dashStyles.metricValue}>{loading ? '...' : stats.users}</span>
                    <span style={dashStyles.metricLabel}>Usuários Cadastrados</span>
                </div>

                <div style={dashStyles.metricCard} onClick={() => onNavigate('clients')} role="button">
                    <div style={dashStyles.metricHeader}>
                        <span style={dashStyles.metricTrend}>Visitantes</span>
                    </div>
                    <span style={dashStyles.metricValue}>{loading ? '...' : stats.clients}</span>
                    <span style={dashStyles.metricLabel}>Clientes / Alunos</span>
                </div>

                <div style={dashStyles.metricCard} onClick={() => onNavigate('register:machines')} role="button">
                    <div style={dashStyles.metricHeader}>
                        <span style={dashStyles.metricTrend}>Patrimônio</span>
                    </div>
                    <span style={dashStyles.metricValue}>{loading ? '...' : stats.equipments}</span>
                    <span style={dashStyles.metricLabel}>Máquinas & Equipamentos</span>
                </div>

                <div style={dashStyles.metricCard} onClick={() => onNavigate('register:machine-loan')} role="button">
                    <div style={dashStyles.metricHeader}>
                        <span style={{ ...dashStyles.metricTrend, color: stats.activeLoans > 0 ? '#b91c1c' : '#15803d' }}>
                            {stats.activeLoans > 0 ? 'Em andamento' : 'Regular'}
                        </span>
                    </div>
                    <span style={dashStyles.metricValue}>{loading ? '...' : stats.activeLoans}</span>
                    <span style={dashStyles.metricLabel}>Empréstimos Ativos</span>
                </div>

                <div style={dashStyles.metricCard} onClick={() => onNavigate('register:supplies')} role="button">
                    <div style={dashStyles.metricHeader}>
                        <span style={{ ...dashStyles.metricTrend, color: stats.lowStockSupplies > 0 ? '#b91c1c' : '#15803d' }}>
                            {stats.lowStockSupplies > 0 ? 'Atenção' : 'OK'}
                        </span>
                    </div>
                    <span style={{ ...dashStyles.metricValue, color: stats.lowStockSupplies > 0 ? '#b91c1c' : '#1a1a1a' }}>
                        {loading ? '...' : stats.lowStockSupplies}
                    </span>
                    <span style={dashStyles.metricLabel}>Insumos c/ Estoque Baixo</span>
                </div>
            </div>

            {/* 3. Seções de Atalhos e Módulos Divididos por Quadrantes */}
            <h3 style={dashStyles.sectionTitle}>Acesso Rápido</h3>

            <div style={dashStyles.modulesGrid}>
                {/* Bloco de Atendimento e Usuários */}
                <div style={dashStyles.moduleBox}>
                    <div style={dashStyles.moduleHeader}>
                        <h4 style={dashStyles.moduleTitle}>Atendimento & Pessoas</h4>
                    </div>
                    <div style={dashStyles.moduleLinks}>
                        <button style={dashStyles.moduleButton} onClick={() => onNavigate('users')}>
                            Gerenciar Usuários →
                        </button>
                        <button style={dashStyles.moduleButton} onClick={() => onNavigate('clients')}>
                            Gerenciar Clientes →
                        </button>
                    </div>
                </div>

                {/* Bloco de Patrimônio e Insumos */}
                <div style={dashStyles.moduleBox}>
                    <div style={dashStyles.moduleHeader}>
                        <h4 style={dashStyles.moduleTitle}>Patrimônio & Estoque</h4>
                    </div>
                    <div style={dashStyles.moduleLinks}>
                        <button style={dashStyles.moduleButton} onClick={() => onNavigate('register:machines')}>
                            Máquinas 3D e Scanners →
                        </button>
                        <button style={dashStyles.moduleButton} onClick={() => onNavigate('register:machine-loan')}>
                            Equipamentos para Empréstimos →
                        </button>
                        <button style={dashStyles.moduleButton} onClick={() => onNavigate('register:supplies')}>
                            Estoque de Filamentos & Resinas →
                        </button>
                    </div>
                </div>

                {/* Bloco de Relatórios Analíticos */}
                <div style={dashStyles.moduleBox}>
                    <div style={dashStyles.moduleHeader}>
                        <h4 style={dashStyles.moduleTitle}>Relatórios & Históricos</h4>
                    </div>
                    <div style={dashStyles.moduleLinks}>
                        <button style={dashStyles.moduleButton} onClick={() => onNavigate('reports:filament-consumption')}>
                            Consumo de filamentos →
                        </button>
                        <button style={dashStyles.moduleButton} onClick={() => onNavigate('reports:machine-usage')}>
                            Uso das Máquinas →
                        </button>
                        <button style={dashStyles.moduleButton} onClick={() => onNavigate('reports:maintenance-history')}>
                            Histórico de Empréstimos →
                        </button>
                        <button style={dashStyles.moduleButton} onClick={() => onNavigate('reports:maintenance-history')}>
                            Histórico de Manutenções →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const dashStyles = {
    heroBanner: {
        backgroundColor: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '28px 32px',
        marginBottom: '24px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
        borderLeft: '6px solid #690013',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
    },
    heroTitle: {
        fontSize: '22px',
        fontWeight: 'bold',
        color: '#1a1a1a',
        margin: '4px 0 6px 0',
    },
    heroSubtitle: {
        fontSize: '13px',
        color: '#64748b',
        margin: 0,
        lineHeight: '1.4',
    },
    heroBadge: {
        backgroundColor: '#fdf2f4',
        border: '1px solid #f8d7da',
        padding: '8px 16px',
        borderRadius: '8px',
        color: '#690013',
        fontWeight: '600',
        fontSize: '13px',
    },
    metricsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
    },
    metricCard: {
        backgroundColor: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '18px 20px',
        cursor: 'pointer',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
    },
    metricHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
    },
    metricIcon: {
        fontSize: '20px',
    },
    metricTrend: {
        fontSize: '11px',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        color: '#64748b',
    },
    metricValue: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: '2px',
    },
    metricLabel: {
        fontSize: '12px',
        color: '#64748b',
    },
    sectionTitle: {
        fontSize: '17px',
        fontWeight: 'bold',
        color: '#1a1a1a',
        margin: '0 0 16px 0',
    },
    modulesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '40px',
    },
    moduleBox: {
        backgroundColor: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '22px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
    },
    moduleHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '16px',
        borderBottom: '1px solid #f1f5f9',
        paddingBottom: '10px',
        fontSize: '18px',
    },
    moduleTitle: {
        fontSize: '15px',
        fontWeight: 'bold',
        color: '#1a1a1a',
        margin: 0,
    },
    moduleLinks: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    moduleButton: {
        background: 'none',
        border: 'none',
        color: '#475569',
        textAlign: 'left',
        padding: '8px 10px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '500',
        transition: 'background-color 0.2s, color 0.2s',
    },
};
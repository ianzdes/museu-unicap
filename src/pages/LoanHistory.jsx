import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export function LoanHistory() {
    const [loanData, setLoanData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // futuramente dados do supabase aqui
        setLoading(false);
    }, []);

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>Histórico de Empréstimos</h2>
                <p style={styles.subtitle}>Acompanhe o fluxo de empréstimos de peças e equipamentos do museu.</p>
            </div>

            <div style={styles.metricGrid}>
                <div style={styles.metricCard}>
                    <span style={styles.metricLabel}>Empréstimos Ativos</span>
                    <span style={styles.metricValue}>0</span>
                </div>

                <div style={styles.metricCard}>
                    <span style={styles.metricLabel}>Total Realizados</span>
                    <span style={styles.metricValue}>0</span>
                </div>
            </div>

            {loading ? (
                <div style={styles.loadingContainer}>
                    <p style={styles.loadingText}>Carregando histórico de empréstimos...</p>
                </div>
            ) : loanData.length === 0 ? (
                <div style={styles.emptyCard}>
                    <span style={styles.emptyIcon}>📋</span>
                    <p style={styles.emptyTitle}>Nenhum empréstimo registrado no momento.</p>
                    <p style={styles.emptySubtitle}>Assim que os primeiros empréstimos forem cadastrados, eles aparecerão aqui.</p>
                </div>
            ) : (
                <div style={styles.tableContainer}>
                    {/* tabela de emprestimos aqui futuramente */}
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        padding: '20px',
        maxWidth: '900px',
        margin: '0 auto',
    },
    header: {
        marginBottom: '24px',
        borderBottom: '2px solid #edf2f7',
        paddingBottom: '12px',
    },
    title: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1a202c',
        margin: '0 0 6px 0',
    },
    subtitle: {
        fontSize: '14px',
        color: '#718096',
        margin: '0',
    },
    metricGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
    },
    metricCard: {
        backgroundColor: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
    },
    metricLabel: {
        display: 'block',
        fontSize: '13px',
        fontWeight: '600',
        color: '#718096',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '8px',
    },
    metricValue: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#2b6cb0',
    },
    loadingContainer: {
        textAlign: 'center',
        padding: '40px',
        backgroundColor: '#fff',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
    },
    loadingText: {
        color: '#718096',
        fontSize: '15px',
    },
    emptyCard: {
        backgroundColor: '#fff',
        border: '1px dashed #cbd5e0',
        borderRadius: '12px',
        padding: '40px 20px',
        textAlign: 'center',
        marginTop: '10px',
    },
    emptyIcon: {
        fontSize: '36px',
        display: 'block',
        marginBottom: '12px',
    },
    emptyTitle: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#2d3748',
        margin: '0 0 6px 0',
    },
    emptySubtitle: {
        fontSize: '13px',
        color: '#a0aec0',
        margin: '0',
    },
    tableContainer: {
        backgroundColor: '#fff',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
    }
};
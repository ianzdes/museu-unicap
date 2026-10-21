import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { styles } from '../../styles/reportStyles';

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
import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { styles } from '../../styles/reportStyles';

export function LoanHistory() {
    const [loanData, setLoanData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLoans();
    }, []);

    async function fetchLoans() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('loans')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setLoanData(data || []);
        } catch (error) {
            console.error('Erro ao buscar histórico de empréstimos:', error.message);
        } finally {
            setLoading(false);
        }
    }

    const totalLoans = loanData.length;
    const activeLoans = loanData.filter(l => l.status?.toLowerCase() === 'ativo' || l.status === 'Em Andamento').length;

    return (
        <div style={styles.container}>
            <div style={styles.headerRow}>
                <div>
                    <span style={styles.miniCategory}>RELATÓRIOS</span>
                    <h2 style={styles.title}>Histórico de Empréstimos</h2>
                    <p style={styles.subtitle}>Acompanhe o fluxo de empréstimos de peças e equipamentos do museu.</p>
                </div>
            </div>

            <div style={styles.metricGrid}>
                <div style={styles.metricCard}>
                    <span style={styles.metricLabel}>Empréstimos Ativos</span>
                    <span style={styles.metricValue}>{activeLoans}</span>
                </div>

                <div style={styles.metricCard}>
                    <span style={styles.metricLabel}>Total Realizados</span>
                    <span style={styles.metricValue}>{totalLoans}</span>
                </div>
            </div>

            {loading ? (
                <div style={styles.loadingContainer}>
                    <p style={styles.loadingText}>Carregando histórico de empréstimos...</p>
                </div>
            ) : loanData.length === 0 ? (
                <div style={styles.emptyCard}>
                    <p style={styles.emptyTitle}>Nenhum empréstimo registrado no momento.</p>
                    <p style={styles.emptySubtitle}>Assim que os primeiros empréstimos forem cadastrados, eles aparecerão aqui.</p>
                </div>
            ) : (
                <div style={styles.tableCard}>
                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.thRow}>
                                    <th style={styles.th}>EQUIPAMENTO</th>
                                    <th style={styles.th}>CLIENTE / ALUNO</th>
                                    <th style={styles.th}>DATA EMPRÉSTIMO</th>
                                    <th style={styles.th}>DATA PREVISTA</th>
                                    <th style={styles.th}>STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loanData.map((item) => (
                                    <tr key={item.id} style={styles.tr}>
                                        <td style={{ ...styles.td, fontWeight: 'bold' }}>
                                            {item.equipment_name || 'Não informado'}
                                        </td>
                                        <td style={styles.td}>
                                            {item.client_name || 'Não informado'}
                                        </td>
                                        <td style={styles.td}>
                                            {item.loan_date 
                                                ? new Date(item.loan_date).toLocaleDateString('pt-BR') 
                                                : '-'}
                                        </td>
                                        <td style={styles.td}>
                                            {item.due_date 
                                                ? new Date(item.due_date).toLocaleDateString('pt-BR') 
                                                : '-'}
                                        </td>
                                        <td style={styles.td}>
                                            <span style={item.status === 'Ativo' ? styles.badgeActive : styles.badgeInactive}>
                                                {item.status || 'Ativo'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
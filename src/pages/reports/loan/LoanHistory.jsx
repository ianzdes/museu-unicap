import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../../supabaseClient';
import styles from './LoanHistory.module.css';

const NO_DATE_KEY = 'sem-data';

const STATUS_BADGE_CLASS = {
    active: styles.badgeInfo,
    returned: styles.badgeActive,
    overdue: styles.badgeInactive,
    other: styles.badgeInfo,
};

// Normaliza o texto do status em uma chave estável
function getStatusKey(status) {
    const s = (status || 'Ativo').toLowerCase();
    if (s === 'ativo' || s === 'em andamento') return 'active';
    if (s === 'devolvido') return 'returned';
    if (s === 'atrasado') return 'overdue';
    return 'other';
}

// "2026-11-05" -> "2026-11". Usa a data de empréstimo; se faltar, a de criação.
function getMonthKey(item) {
    const raw = (item.loan_date || item.created_at || '').slice(0, 7);
    return /^\d{4}-\d{2}$/.test(raw) ? raw : NO_DATE_KEY;
}

// "2026-11" -> "Novembro de 2026"
function formatMonth(key) {
    if (key === NO_DATE_KEY) return 'Sem data';
    const [year, month] = key.split('-').map(Number);
    const label = new Date(year, month - 1, 1).toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
    });
    return label.charAt(0).toUpperCase() + label.slice(1);
}

// Formata "YYYY-MM-DD" sem passar por Date, evitando o deslocamento de fuso
// (new Date('2026-11-05') vira 04/11 no horário de Brasília).
function formatDate(value) {
    if (!value) return '-';
    const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
    return match ? `${match[3]}/${match[2]}/${match[1]}` : '-';
}

export function LoanHistory() {
    const [loanData, setLoanData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState('all');

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

    // Agrupa os empréstimos por mês (mais recente primeiro, "sem data" por último)
    const monthlySummary = useMemo(() => {
        const map = new Map();

        loanData.forEach((item) => {
            const key = getMonthKey(item);
            if (!map.has(key)) {
                map.set(key, { key, total: 0, active: 0, returned: 0, overdue: 0 });
            }
            const entry = map.get(key);
            entry.total += 1;

            const statusKey = getStatusKey(item.status);
            if (statusKey !== 'other') entry[statusKey] += 1;
        });

        return Array.from(map.values()).sort((a, b) => {
            if (a.key === NO_DATE_KEY) return 1;
            if (b.key === NO_DATE_KEY) return -1;
            return b.key.localeCompare(a.key);
        });
    }, [loanData]);

    const maxMonthlyTotal = Math.max(1, ...monthlySummary.map((m) => m.total));

    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const thisMonthTotal = monthlySummary.find((m) => m.key === currentMonthKey)?.total || 0;

    const totalLoans = loanData.length;
    const activeLoans = loanData.filter((l) => getStatusKey(l.status) === 'active').length;

    const visibleLoans = selectedMonth === 'all'
        ? loanData
        : loanData.filter((item) => getMonthKey(item) === selectedMonth);

    const toggleMonth = (key) => {
        setSelectedMonth((prev) => (prev === key ? 'all' : key));
    };

    return (
        <div className={styles.container}>

            {/* Cabeçalho */}
            <div className={styles.headerRow}>
                <div>
                    <span className={styles.miniCategory}>RELATÓRIOS</span>
                    <h2 className={styles.title}>Histórico de Empréstimos</h2>
                    <p className={styles.subtitle}>
                        Acompanhe o fluxo mensal de empréstimos de peças e equipamentos do museu.
                    </p>
                </div>
            </div>

            {/* Métricas */}
            <div className={styles.metricGrid}>
                <div className={styles.metricCard}>
                    <span className={styles.metricLabel}>Empréstimos Ativos</span>
                    <span className={styles.metricValue}>{activeLoans}</span>
                </div>

                <div className={styles.metricCard}>
                    <span className={styles.metricLabel}>Neste Mês</span>
                    <span className={styles.metricValue}>{thisMonthTotal}</span>
                </div>

                <div className={styles.metricCard}>
                    <span className={styles.metricLabel}>Total Realizados</span>
                    <span className={styles.metricValue}>{totalLoans}</span>
                </div>
            </div>

            {loading ? (

                <div className={styles.loadingContainer}>
                    <p className={styles.loadingText}>Carregando histórico de empréstimos...</p>
                </div>

            ) : loanData.length === 0 ? (

                <div className={styles.emptyCard}>
                    <p className={styles.emptyTitle}>Nenhum empréstimo registrado no momento.</p>
                    <p className={styles.emptySubtitle}>
                        Assim que os primeiros empréstimos forem cadastrados, eles aparecerão aqui.
                    </p>
                </div>

            ) : (
                <>
                    {/* Resumo por mês */}
                    <div className={styles.tableCard}>
                        <div className={styles.sectionHeader}>
                            <div>
                                <h3 className={styles.sectionTitle}>Resumo por mês</h3>
                                <p className={styles.sectionHint}>
                                    Clique em um mês para ver os empréstimos dele.
                                </p>
                            </div>
                        </div>

                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr className={styles.thRow}>
                                        <th className={styles.th}>MÊS</th>
                                        <th className={styles.th}>EMPRÉSTIMOS</th>
                                        <th className={styles.th}>ATIVOS</th>
                                        <th className={styles.th}>DEVOLVIDOS</th>
                                        <th className={styles.th}>ATRASADOS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {monthlySummary.map((month) => (
                                        <tr
                                            key={month.key}
                                            className={`${styles.tr} ${styles.trClickable} ${selectedMonth === month.key ? styles.trSelected : ''}`}
                                            onClick={() => toggleMonth(month.key)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    toggleMonth(month.key);
                                                }
                                            }}
                                            tabIndex={0}
                                            role="button"
                                            aria-pressed={selectedMonth === month.key}
                                        >
                                            <td className={`${styles.td} ${styles.tdStrong}`}>
                                                {formatMonth(month.key)}
                                            </td>
                                            <td className={styles.td}>
                                                <div className={styles.totalCell}>
                                                    <span className={styles.totalNumber}>{month.total}</span>
                                                    <div className={styles.barTrack}>
                                                        <div
                                                            className={styles.barFill}
                                                            style={{ width: `${(month.total / maxMonthlyTotal) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={`${styles.td} ${month.active === 0 ? styles.muted : ''}`}>
                                                {month.active}
                                            </td>
                                            <td className={`${styles.td} ${month.returned === 0 ? styles.muted : ''}`}>
                                                {month.returned}
                                            </td>
                                            <td className={`${styles.td} ${month.overdue === 0 ? styles.muted : ''}`}>
                                                {month.overdue}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Detalhamento */}
                    <div className={styles.tableCard}>
                        <div className={styles.sectionHeader}>
                            <h3 className={styles.sectionTitle}>
                                {selectedMonth === 'all'
                                    ? 'Todos os empréstimos'
                                    : `Empréstimos de ${formatMonth(selectedMonth)}`}
                                {' '}({visibleLoans.length})
                            </h3>

                            <div>
                                {selectedMonth !== 'all' && (
                                    <button
                                        type="button"
                                        className={styles.clearButton}
                                        onClick={() => setSelectedMonth('all')}
                                    >
                                        Limpar filtro
                                    </button>
                                )}
                                {' '}
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className={styles.selectFilter}
                                >
                                    <option value="all">Mês: todos</option>
                                    {monthlySummary.map((month) => (
                                        <option key={month.key} value={month.key}>
                                            {formatMonth(month.key)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr className={styles.thRow}>
                                        <th className={styles.th}>EQUIPAMENTO</th>
                                        <th className={styles.th}>CLIENTE / ALUNO</th>
                                        <th className={styles.th}>DATA EMPRÉSTIMO</th>
                                        <th className={styles.th}>DATA PREVISTA</th>
                                        <th className={styles.th}>STATUS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visibleLoans.map((item) => {
                                        const statusKey = getStatusKey(item.status);

                                        return (
                                            <tr key={item.id} className={styles.tr}>
                                                <td className={`${styles.td} ${styles.tdStrong}`}>
                                                    {item.equipment_name || 'Não informado'}
                                                </td>
                                                <td className={styles.td}>
                                                    {item.client_name || 'Não informado'}
                                                </td>
                                                <td className={styles.td}>{formatDate(item.loan_date)}</td>
                                                <td className={styles.td}>{formatDate(item.due_date)}</td>
                                                <td className={styles.td}>
                                                    <span className={`${styles.badge} ${STATUS_BADGE_CLASS[statusKey]}`}>
                                                        {item.status || 'Ativo'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

        </div>
    );
}
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../../supabaseClient';
import styles from './FilamentReport.module.css';

const NO_DATE_KEY = 'sem-data';

/* ===================== Helpers ===================== */

// Mês da produção: usa production_date; se faltar, created_at
function getMonthKey(item) {
    const raw = (item.production_date || item.created_at || '').slice(0, 7);
    return /^\d{4}-\d{2}$/.test(raw) ? raw : NO_DATE_KEY;
}

// "2026-11" -> "2026-10"
function getPreviousMonthKey(key) {
    if (key === NO_DATE_KEY) return null;
    const [year, month] = key.split('-').map(Number);
    const d = new Date(year, month - 2, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
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

// "2026-11-05" -> "05/11/2026" (sem passar por Date, evita deslocamento de fuso)
function formatDate(value) {
    if (!value) return '-';
    const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
    return match ? `${match[3]}/${match[2]}/${match[1]}` : '-';
}

// 850 -> "850 g" | 2350 -> "2,35 kg"
function formatWeight(grams) {
    const g = Number(grams) || 0;
    if (g >= 1000) {
        return `${(g / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} kg`;
    }
    return `${g.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} g`;
}

// Variação percentual em relação ao mês anterior
function formatVariation(current, previous) {
    if (!previous) return '—';
    const pct = ((current - previous) / previous) * 100;
    if (Math.abs(pct) < 0.5) return '= 0%';
    const arrow = pct > 0 ? '▲' : '▼';
    return `${arrow} ${Math.abs(pct).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}%`;
}

// Mesma regra de status usada no cadastro de insumos
function getStockStatus(item) {
    if (item.current_stock_grams == null) {
        return { key: 'unknown', label: 'N/D', className: styles.badgeInfo };
    }
    const grams = Number(item.current_stock_grams);
    if (item.status === 'Esgotado' || grams <= 0) {
        return { key: 'out', label: 'Esgotado', className: styles.badgeInactive };
    }
    if (item.status === 'Baixo Estoque' || grams <= 200) {
        return { key: 'low', label: 'Baixo Estoque', className: styles.badgeWarning };
    }
    return { key: 'ok', label: 'Em Estoque', className: styles.badgeActive };
}

/* ===================== Componente ===================== */

export function FilamentReport() {
    const [productions, setProductions] = useState([]);
    const [supplies, setSupplies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState('all');

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            setLoading(true);

            // O consumo vem das produções que usaram insumo (supply_grams > 0);
            // a tabela de insumos mostra apenas o estoque atual.
            const [productionsRes, suppliesRes] = await Promise.all([
                supabase
                    .from('productions')
                    .select('*')
                    .gt('supply_grams', 0)
                    .order('production_date', { ascending: false })
                    .order('created_at', { ascending: false }),
                supabase
                    .from('supplies')
                    .select('*')
                    .order('name', { ascending: true }),
            ]);

            if (productionsRes.error) throw productionsRes.error;
            if (suppliesRes.error) throw suppliesRes.error;

            setProductions(productionsRes.data || []);
            setSupplies(suppliesRes.data || []);
        } catch (error) {
            console.error('Erro ao buscar dados de consumo de estoque:', error.message);
        } finally {
            setLoading(false);
        }
    }

    // Consumo agrupado por mês (mais recente primeiro, "sem data" por último)
    const monthlySummary = useMemo(() => {
        const map = new Map();

        productions.forEach((item) => {
            const key = getMonthKey(item);
            if (!map.has(key)) {
                map.set(key, { key, total: 0, count: 0 });
            }
            const entry = map.get(key);
            entry.total += Number(item.supply_grams) || 0;
            entry.count += 1;
        });

        return Array.from(map.values())
            .sort((a, b) => {
                if (a.key === NO_DATE_KEY) return 1;
                if (b.key === NO_DATE_KEY) return -1;
                return b.key.localeCompare(a.key);
            })
            .map((entry) => ({
                ...entry,
                average: entry.total / entry.count,
                previousTotal: map.get(getPreviousMonthKey(entry.key))?.total || 0,
            }));
    }, [productions]);

    const maxMonthlyTotal = Math.max(1, ...monthlySummary.map((m) => m.total));

    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const thisMonthTotal = monthlySummary.find((m) => m.key === currentMonthKey)?.total || 0;

    const datedMonths = monthlySummary.filter((m) => m.key !== NO_DATE_KEY);
    const totalConsumed = monthlySummary.reduce((sum, m) => sum + m.total, 0);
    const averageMonthly = datedMonths.length > 0
        ? datedMonths.reduce((sum, m) => sum + m.total, 0) / datedMonths.length
        : 0;

    // Estoque atual (tabela supplies)
    const currentStockTotal = supplies.reduce((sum, s) => sum + (Number(s.current_stock_grams) || 0), 0);
    const lowStockCount = supplies.filter((s) => {
        const key = getStockStatus(s).key;
        return key === 'low' || key === 'out';
    }).length;

    // Produções do período selecionado
    const visibleProductions = selectedMonth === 'all'
        ? productions
        : productions.filter((item) => getMonthKey(item) === selectedMonth);

    const visibleTotal = visibleProductions.reduce((sum, p) => sum + (Number(p.supply_grams) || 0), 0);

    // Consumo por máquina no período selecionado
    const machineBreakdown = useMemo(() => {
        const map = new Map();

        visibleProductions.forEach((item) => {
            const name = item.equipment_name || 'Não informada';
            if (!map.has(name)) {
                map.set(name, { name, total: 0, count: 0 });
            }
            const entry = map.get(name);
            entry.total += Number(item.supply_grams) || 0;
            entry.count += 1;
        });

        return Array.from(map.values()).sort((a, b) => b.total - a.total);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productions, selectedMonth]);

    const maxMachineTotal = Math.max(1, ...machineBreakdown.map((m) => m.total));

    const toggleMonth = (key) => {
        setSelectedMonth((prev) => (prev === key ? 'all' : key));
    };

    const periodLabel = selectedMonth === 'all' ? 'todos os meses' : formatMonth(selectedMonth);

    return (
        <div className={styles.container}>

            {/* Cabeçalho */}
            <div className={styles.headerRow}>
                <div>
                    <span className={styles.miniCategory}>RELATÓRIOS</span>
                    <h2 className={styles.title}>Consumo Mensal de Estoque</h2>
                    <p className={styles.subtitle}>
                        Acompanhe quanto de filamento e resina foi consumido a cada mês e o que ainda resta em estoque.
                    </p>
                </div>
            </div>

            {/* Métricas */}
            <div className={styles.metricGrid}>
                <div className={styles.metricCard}>
                    <span className={styles.metricLabel}>Consumo neste mês</span>
                    <span className={styles.metricValue}>{formatWeight(thisMonthTotal)}</span>
                </div>

                <div className={styles.metricCard}>
                    <span className={styles.metricLabel}>Média mensal</span>
                    <span className={styles.metricValue}>{formatWeight(averageMonthly)}</span>
                </div>

                <div className={styles.metricCard}>
                    <span className={styles.metricLabel}>Total consumido</span>
                    <span className={styles.metricValue}>{formatWeight(totalConsumed)}</span>
                </div>

                <div className={styles.metricCard}>
                    <span className={styles.metricLabel}>Estoque atual</span>
                    <span className={styles.metricValue}>{formatWeight(currentStockTotal)}</span>
                    <span className={styles.metricHint}>
                        {lowStockCount > 0
                            ? `${lowStockCount} insumo(s) com estoque baixo`
                            : 'Nenhum insumo com estoque baixo'}
                    </span>
                </div>
            </div>

            {loading ? (

                <div className={styles.loadingContainer}>
                    <p className={styles.loadingText}>Carregando dados de consumo...</p>
                </div>

            ) : productions.length === 0 ? (

                <div className={styles.emptyCard}>
                    <p className={styles.emptyTitle}>Nenhum consumo registrado no momento.</p>
                    <p className={styles.emptySubtitle}>
                        O consumo é calculado a partir das produções com insumo registradas no
                        Relatório de Produção.
                    </p>
                </div>

            ) : (
                <>
                    {/* Consumo por mês */}
                    <div className={styles.tableCard}>
                        <div className={styles.sectionHeader}>
                            <div>
                                <h3 className={styles.sectionTitle}>Consumo por mês</h3>
                                <p className={styles.sectionHint}>
                                    Clique em um mês para ver o detalhamento dele.
                                </p>
                            </div>
                        </div>

                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr className={styles.thRow}>
                                        <th className={styles.th}>MÊS</th>
                                        <th className={styles.th}>CONSUMO</th>
                                        <th className={styles.th}>PRODUÇÕES COM INSUMO</th>
                                        <th className={styles.th}>MÉDIA POR PRODUÇÃO</th>
                                        <th className={styles.th}>VS. MÊS ANTERIOR</th>
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
                                                    <span className={styles.totalNumber}>
                                                        {formatWeight(month.total)}
                                                    </span>
                                                    <div className={styles.barTrack}>
                                                        <div
                                                            className={styles.barFill}
                                                            style={{ width: `${(month.total / maxMonthlyTotal) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={styles.td}>{month.count}</td>
                                            <td className={`${styles.td} ${styles.tdNowrap}`}>
                                                {formatWeight(month.average)}
                                            </td>
                                            <td className={`${styles.td} ${styles.variation}`}>
                                                {formatVariation(month.total, month.previousTotal)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Consumo por máquina */}
                    <div className={styles.tableCard}>
                        <div className={styles.sectionHeader}>
                            <div>
                                <h3 className={styles.sectionTitle}>
                                    Consumo por máquina ({periodLabel})
                                </h3>
                                <p className={styles.sectionHint}>
                                    Quanto cada máquina consumiu no período selecionado.
                                </p>
                            </div>

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
                                        <th className={styles.th}>MÁQUINA</th>
                                        <th className={styles.th}>CONSUMO</th>
                                        <th className={styles.th}>PRODUÇÕES</th>
                                        <th className={styles.th}>% DO PERÍODO</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {machineBreakdown.map((machine) => (
                                        <tr key={machine.name} className={styles.tr}>
                                            <td className={`${styles.td} ${styles.tdStrong}`}>{machine.name}</td>
                                            <td className={styles.td}>
                                                <div className={styles.totalCell}>
                                                    <span className={styles.totalNumber}>
                                                        {formatWeight(machine.total)}
                                                    </span>
                                                    <div className={styles.barTrack}>
                                                        <div
                                                            className={styles.barFill}
                                                            style={{ width: `${(machine.total / maxMachineTotal) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={styles.td}>{machine.count}</td>
                                            <td className={styles.td}>
                                                {visibleTotal > 0
                                                    ? `${((machine.total / visibleTotal) * 100).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}%`
                                                    : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className={styles.totalRow}>
                                        <td className={styles.td}>TOTAL</td>
                                        <td className={styles.td}>{formatWeight(visibleTotal)}</td>
                                        <td className={styles.td}>{visibleProductions.length}</td>
                                        <td className={styles.td}>100%</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Produções do período */}
                    <div className={styles.tableCard}>
                        <div className={styles.sectionHeader}>
                            <h3 className={styles.sectionTitle}>
                                Produções com consumo ({visibleProductions.length})
                            </h3>
                        </div>

                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr className={styles.thRow}>
                                        <th className={styles.th}>DATA</th>
                                        <th className={styles.th}>DESCRIÇÃO</th>
                                        <th className={styles.th}>TÉCNICO</th>
                                        <th className={styles.th}>MÁQUINA</th>
                                        <th className={styles.th}>CONSUMO</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visibleProductions.map((item) => (
                                        <tr key={item.id} className={styles.tr}>
                                            <td className={`${styles.td} ${styles.tdNowrap}`}>
                                                {formatDate(item.production_date)}
                                            </td>
                                            <td className={`${styles.td} ${styles.tdDescription}`}>
                                                {item.description || 'Não informada'}
                                            </td>
                                            <td className={styles.td}>{item.technician_name || 'Não informado'}</td>
                                            <td className={styles.td}>{item.equipment_name || 'Não informada'}</td>
                                            <td className={`${styles.td} ${styles.tdStrong} ${styles.tdNowrap}`}>
                                                {formatWeight(item.supply_grams)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* Estoque atual */}
            {!loading && supplies.length > 0 && (
                <div className={styles.tableCard}>
                    <div className={styles.sectionHeader}>
                        <div>
                            <h3 className={styles.sectionTitle}>Situação atual do estoque</h3>
                            <p className={styles.sectionHint}>
                                Saldo de cada insumo cadastrado.
                            </p>
                        </div>
                    </div>

                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr className={styles.thRow}>
                                    <th className={styles.th}>INSUMO</th>
                                    <th className={styles.th}>MATERIAL</th>
                                    <th className={styles.th}>COR</th>
                                    <th className={styles.th}>ESTOQUE ATUAL</th>
                                    <th className={styles.th}>STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {supplies.map((item) => {
                                    const stockStatus = getStockStatus(item);

                                    return (
                                        <tr key={item.id} className={styles.tr}>
                                            <td className={`${styles.td} ${styles.tdStrong}`}>
                                                {item.name || 'Material não informado'}
                                            </td>
                                            <td className={styles.td}>{item.material || '—'}</td>
                                            <td className={styles.td}>{item.color || 'Não especificada'}</td>
                                            <td className={`${styles.td} ${styles.tdStrong} ${styles.tdNowrap}`}>
                                                {item.current_stock_grams != null
                                                    ? formatWeight(item.current_stock_grams)
                                                    : 'N/D'}
                                            </td>
                                            <td className={styles.td}>
                                                <span className={`${styles.badge} ${stockStatus.className}`}>
                                                    ● {stockStatus.label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

        </div>
    );
}
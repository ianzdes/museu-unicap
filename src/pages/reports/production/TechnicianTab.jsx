// aba "mensal por tecnico": resumo do mes e evolucao
import { useState } from 'react';
import { TableHead } from './TableHead';
import {
    formatDuration,
    formatMonth,
    formatSupply,
    getMonthKey,
    summarize,
    uniqueMonths,
    uniqueTechnicians,
} from './ProductionUtils';
import styles from './ProductionReport.module.css';

const HEADERS = ['TÉCNICO', 'PRODUÇÕES', 'IMPRESSÕES', 'DIGITALIZAÇÕES', 'INSUMO', 'TEMPO TOTAL', 'TEMPO MÉDIO'];

// Aba "Mensal por técnico": resumo do mês escolhido e evolução dos últimos meses.
export function TechnicianTab({ productions }) {
    const [selectedMonth, setSelectedMonth] = useState(''); // '' = mês mais recente

    const monthKeys = uniqueMonths(productions);
    const technicianNames = uniqueTechnicians(productions);

    // Resumo do mês: um total por técnico, do que mais produziu para o que menos produziu
    const monthKey = monthKeys.includes(selectedMonth) ? selectedMonth : monthKeys[0];
    const monthProductions = productions.filter((p) => getMonthKey(p) === monthKey);
    const monthSummary = summarize(monthProductions);

    const technicianRows = uniqueTechnicians(monthProductions)
        .map((name) => ({
            name,
            ...summarize(monthProductions.filter((p) => p.technician_name === name)),
        }))
        .sort((a, b) => b.total - a.total);

    const maxTotal = Math.max(1, ...technicianRows.map((t) => t.total));

    // Evolução: produções por técnico nos últimos 6 meses (ordem cronológica)
    const pivotMonths = monthKeys.slice(0, 6).reverse();
    const pivotRows = technicianNames
        .map((name) => {
            const cells = pivotMonths.map((month) =>
                productions.filter((p) => p.technician_name === name && getMonthKey(p) === month).length
            );
            return { name, cells, total: cells.reduce((sum, count) => sum + count, 0) };
        })
        .filter((row) => row.total > 0);

    return (
        <>
            {/* Resumo do mês escolhido */}
            <div className={styles.tableCard}>
                <div className={styles.sectionHeader}>
                    <div>
                        <h3 className={styles.sectionTitle}>Produção de {formatMonth(monthKey)}</h3>
                        <p className={styles.sectionHint}>Desempenho de cada técnico no mês selecionado.</p>
                    </div>

                    <select
                        value={monthKey}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className={styles.selectFilter}
                    >
                        {monthKeys.map((key) => (
                            <option key={key} value={key}>{formatMonth(key)}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <TableHead columns={HEADERS} />
                        <tbody>
                            {technicianRows.map((tech) => (
                                <tr key={tech.name} className={styles.tr}>
                                    <td className={`${styles.td} ${styles.tdStrong}`}>{tech.name}</td>
                                    <td className={styles.td}>
                                        <div className={styles.totalCell}>
                                            <span className={styles.totalNumber}>{tech.total}</span>
                                            <div className={styles.barTrack}>
                                                <div
                                                    className={styles.barFill}
                                                    style={{ width: `${(tech.total / maxTotal) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className={`${styles.td} ${tech.prints === 0 ? styles.tdMuted : ''}`}>
                                        {tech.prints}
                                    </td>
                                    <td className={`${styles.td} ${tech.scans === 0 ? styles.tdMuted : ''}`}>
                                        {tech.scans}
                                    </td>
                                    <td className={`${styles.td} ${styles.tdNowrap}`}>{formatSupply(tech.supply)}</td>
                                    <td className={`${styles.td} ${styles.tdNowrap}`}>{formatDuration(tech.minutes)}</td>
                                    <td className={`${styles.td} ${styles.tdNowrap}`}>
                                        {formatDuration(tech.minutes / tech.total)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className={styles.totalRow}>
                                <td className={styles.td}>TOTAL DO MÊS</td>
                                <td className={styles.td}>{monthSummary.total}</td>
                                <td className={styles.td}>{monthSummary.prints}</td>
                                <td className={styles.td}>{monthSummary.scans}</td>
                                <td className={`${styles.td} ${styles.tdNowrap}`}>{formatSupply(monthSummary.supply)}</td>
                                <td className={`${styles.td} ${styles.tdNowrap}`}>{formatDuration(monthSummary.minutes)}</td>
                                <td className={`${styles.td} ${styles.tdNowrap}`}>
                                    {formatDuration(monthSummary.minutes / monthSummary.total)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Evolução: técnico x mês */}
            <div className={styles.tableCard}>
                <div className={styles.sectionHeader}>
                    <div>
                        <h3 className={styles.sectionTitle}>Evolução mensal por técnico</h3>
                        <p className={styles.sectionHint}>Quantidade de produções nos últimos meses com registros.</p>
                    </div>
                </div>

                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <TableHead
                            columns={[
                                'TÉCNICO',
                                ...pivotMonths.map((month) => formatMonth(month, true).toUpperCase()),
                                'TOTAL',
                            ]}
                        />
                        <tbody>
                            {pivotRows.map((row) => (
                                <tr key={row.name} className={styles.tr}>
                                    <td className={`${styles.td} ${styles.tdStrong}`}>{row.name}</td>
                                    {row.cells.map((count, index) => (
                                        <td
                                            key={pivotMonths[index]}
                                            className={`${styles.td} ${count === 0 ? styles.tdMuted : ''}`}
                                        >
                                            {count === 0 ? '—' : count}
                                        </td>
                                    ))}
                                    <td className={`${styles.td} ${styles.tdStrong}`}>{row.total}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
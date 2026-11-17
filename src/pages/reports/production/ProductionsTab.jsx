// aba "producoes": metricas, filtro e tabelas
import { useState } from 'react';
import { TableHead } from './TableHead';
import {
    TYPE_PRINT,
    TYPE_SCAN,
    formatDate,
    formatDuration,
    formatMonth,
    formatSupply,
    getMonthKey,
    summarize,
    uniqueMonths,
    uniqueTechnicians,
} from './ProductionUtils';
import styles from './ProductionReport.module.css';

const HEADERS = ['DATA', 'DESCRIÇÃO', 'TIPO', 'TÉCNICO', 'CLIENTE', 'MÁQUINA', 'INSUMO', 'TEMPO', 'AÇÕES'];

// Aba "Produções": métricas e tabela com filtros.
//   productions: todas as produções
//   onManage:    chamada com a produção escolhida ao clicar em "Gerenciar"
export function ProductionsTab({ productions, onManage }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [monthFilter, setMonthFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [technicianFilter, setTechnicianFilter] = useState('all');

    const monthKeys = uniqueMonths(productions);
    const technicianNames = uniqueTechnicians(productions);

    const filtered = productions.filter((item) => {
        const text = [item.description, item.client_name, item.equipment_name, item.technician_name]
            .join(' ')
            .toLowerCase();

        return text.includes(searchTerm.toLowerCase())
            && (monthFilter === 'all' || getMonthKey(item) === monthFilter)
            && (typeFilter === 'all' || item.production_type === typeFilter)
            && (technicianFilter === 'all' || item.technician_name === technicianFilter);
    });

    // Métricas acompanham os filtros (tempo médio = tempo total / quantidade)
    const summary = summarize(filtered);

    return (
        <>
            <div className={styles.metricGrid}>
                <div className={styles.metricCard}>
                    <span className={styles.metricLabel}>Produções</span>
                    <span className={styles.metricValue}>{summary.total}</span>
                </div>

                <div className={styles.metricCard}>
                    <span className={styles.metricLabel}>Tempo Médio</span>
                    <span className={styles.metricValue}>
                        {formatDuration(summary.minutes / summary.total)}
                    </span>
                </div>

                <div className={styles.metricCard}>
                    <span className={styles.metricLabel}>Insumo Consumido</span>
                    <span className={styles.metricValue}>{formatSupply(summary.supply)}</span>
                </div>
            </div>

            <div className={styles.tableCard}>
                <div className={styles.filterBar}>
                    <input
                        type="text"
                        placeholder="Pesquisar por descrição, cliente, técnico ou máquina..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                    <select
                        value={monthFilter}
                        onChange={(e) => setMonthFilter(e.target.value)}
                        className={styles.selectFilter}
                    >
                        <option value="all">Mês: todos</option>
                        {monthKeys.map((key) => (
                            <option key={key} value={key}>{formatMonth(key)}</option>
                        ))}
                    </select>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className={styles.selectFilter}
                    >
                        <option value="all">Tipo: todos</option>
                        <option value={TYPE_PRINT}>Impressão 3D</option>
                        <option value={TYPE_SCAN}>Digitalização</option>
                    </select>
                    <select
                        value={technicianFilter}
                        onChange={(e) => setTechnicianFilter(e.target.value)}
                        className={styles.selectFilter}
                    >
                        <option value="all">Técnico: todos</option>
                        {technicianNames.map((tech) => (
                            <option key={tech} value={tech}>{tech}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <TableHead columns={HEADERS} />
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={HEADERS.length} className={styles.emptyCell}>
                                        Nenhuma produção encontrada para os filtros selecionados.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((item) => (
                                    <tr key={item.id} className={styles.tr}>
                                        <td className={`${styles.td} ${styles.tdNowrap}`}>
                                            {formatDate(item.production_date)}
                                        </td>
                                        <td className={`${styles.td} ${styles.tdDescription}`}>
                                            {item.description}
                                        </td>
                                        <td className={styles.td}>
                                            <span className={`${styles.badge} ${item.production_type === TYPE_PRINT ? styles.badgeInfo : styles.badgeWarning}`}>
                                                {item.production_type}
                                            </span>
                                        </td>
                                        <td className={styles.td}>{item.technician_name}</td>
                                        <td className={styles.td}>{item.client_name}</td>
                                        <td className={styles.td}>{item.equipment_name}</td>
                                        <td className={`${styles.td} ${styles.tdNowrap}`}>
                                            {formatSupply(item.supply_grams)}
                                        </td>
                                        <td className={`${styles.td} ${styles.tdNowrap}`}>
                                            {formatDuration(item.production_minutes)}
                                        </td>
                                        <td className={styles.td}>
                                            <button onClick={() => onManage(item)} className={styles.actionBtn}>
                                                Gerenciar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
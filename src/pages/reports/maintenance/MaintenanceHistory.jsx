import { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import styles from './MaintenanceHistory.module.css';

export function MaintenanceHistory() {
    const [maintenanceData, setMaintenanceData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMaintenance();
    }, []);

    async function fetchMaintenance() {
        try {
            setLoading(true);

            const { data, error } = await supabase
                .from('maintenance')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            setMaintenanceData(data || []);
        } catch (error) {
            console.error(
                'Erro ao buscar histórico de manutenções:',
                error.message
            );
        } finally {
            setLoading(false);
        }
    }

    // Métricas calculadas dinamicamente
    const totalRealizadas = maintenanceData.length;

    const emManutencao = maintenanceData.filter(m =>
        m.type?.toLowerCase() === 'corretiva' ||
        m.status === 'Em Andamento'
    ).length;

    return (
        <div className={styles.container}>
            {/* Cabeçalho */}
            <div className={styles.headerRow}>
                <div>
                    <span className={styles.miniCategory}>
                        RELATÓRIOS
                    </span>

                    <h2 className={styles.title}>
                        Histórico de Manutenções
                    </h2>

                    <p className={styles.subtitle}>
                        Acompanhe as manutenções, reparos e revisões dos equipamentos.
                    </p>
                </div>
            </div>

            {/* Cards de métricas */}
            <div className={styles.metricGrid}>
                <div className={styles.metricCard}>
                    <span className={styles.metricLabel}>
                        Total Registrado
                    </span>

                    <span className={styles.metricValue}>
                        {totalRealizadas}
                    </span>
                </div>

                <div className={styles.metricCard}>
                    <span className={styles.metricLabel}>
                        Em Manutenção / Críticos
                    </span>

                    <span className={styles.metricValue}>
                        {emManutencao}
                    </span>
                </div>
            </div>

            {/* Estados de renderização */}
            {loading ? (
                <div className={styles.loadingContainer}>
                    <p className={styles.loadingText}>
                        Carregando histórico de manutenções...
                    </p>
                </div>
            ) : maintenanceData.length === 0 ? (
                <div className={styles.emptyCard}>
                    <p className={styles.emptyTitle}>
                        Nenhuma manutenção registrada no momento.
                    </p>

                    <p className={styles.emptySubtitle}>
                        Assim que os primeiros registros forem cadastrados na tabela, eles aparecerão aqui.
                    </p>
                </div>
            ) : (
                /* Tabela */
                <div className={styles.tableCard}>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr className={styles.thRow}>
                                    <th className={styles.th}>EQUIPAMENTO</th>
                                    <th className={styles.th}>TIPO</th>
                                    <th className={styles.th}>TÉCNICO</th>
                                    <th className={styles.th}>DATA</th>
                                    <th className={styles.th}>DESCRIÇÃO</th>
                                </tr>
                            </thead>

                            <tbody>
                                {maintenanceData.map((item) => (
                                    <tr key={item.id} className={styles.tr}>
                                        <td className={`${styles.td} ${styles.equipmentName}`}>
                                            {item.equipment_name || 'Equipamento não informado'}
                                        </td>

                                        <td className={styles.td}>
                                            <span
                                                className={
                                                    item.type?.toLowerCase() === 'preventiva'
                                                        ? styles.badgeInfo
                                                        : styles.badgeWarning
                                                }
                                            >
                                                {item.type || 'Geral'}
                                            </span>
                                        </td>

                                        <td className={styles.td}>
                                            {item.technician || 'Não informado'}
                                        </td>

                                        <td className={styles.td}>
                                            {item.maintenance_date
                                                ? new Date(item.maintenance_date).toLocaleDateString('pt-BR')
                                                : '-'}
                                        </td>

                                        <td className={`${styles.td} ${styles.description}`}>
                                            {item.description || 'Sem observações'}
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

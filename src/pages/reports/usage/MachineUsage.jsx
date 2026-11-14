import { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import styles from './MachineUsage.module.css';

// Verifica se a máquina está disponível
function isMachineAvailable(status) {
    const normalizedStatus = status?.trim().toLowerCase();

    return ['disponível', 'ativo'].includes(normalizedStatus);
}

export function MachineUsage() {
    const [machineData, setMachineData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMachineUsage();
    }, []);

    async function fetchMachineUsage() {
        try {
            setLoading(true);

            const { data, error } = await supabase
                .from('equipments')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            setMachineData(data || []);
        } catch (error) {
            console.error('Erro ao buscar uso de máquinas:', error.message);
        } finally {
            setLoading(false);
        }
    }

    // Métricas
    const totalMachines = machineData.length;

    const availableMachines = machineData.filter(
        item => isMachineAvailable(item.status)
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
                        Uso das Máquinas
                    </h2>

                    <p className={styles.subtitle}>
                        Monitore o status operacional, disponibilidade e condição
                        das máquinas e equipamentos.
                    </p>
                </div>
            </div>

            {/* Métricas */}
            <div className={styles.metricGrid}>

                <div className={styles.metricCard}>
                    <span className={styles.metricLabel}>
                        Total Cadastrado
                    </span>

                    <span className={styles.metricValue}>
                        {totalMachines}
                    </span>
                </div>

                <div className={styles.metricCard}>
                    <span className={styles.metricLabel}>
                        Disponíveis / Operacionais
                    </span>

                    <span className={styles.metricValue}>
                        {availableMachines}
                    </span>
                </div>

            </div>

            {/* Dados / Tabela */}
            {loading ? (

                <div className={styles.loadingContainer}>
                    <p className={styles.loadingText}>
                        Carregando dados de uso das máquinas...
                    </p>
                </div>

            ) : machineData.length === 0 ? (

                <div className={styles.emptyCard}>
                    <p className={styles.emptyTitle}>
                        Nenhuma máquina registrada no momento.
                    </p>

                    <p className={styles.emptySubtitle}>
                        Assim que os primeiros equipamentos forem cadastrados,
                        eles aparecerão aqui.
                    </p>
                </div>

            ) : (

                <div className={styles.tableCard}>
                    <div className={styles.tableContainer}>

                        <table className={styles.table}>

                            <thead>
                                <tr className={styles.thRow}>
                                    <th className={styles.th}>
                                        CÓDIGO / PATRIMÔNIO
                                    </th>

                                    <th className={styles.th}>
                                        NOME
                                    </th>

                                    <th className={styles.th}>
                                        CATEGORIA
                                    </th>

                                    <th className={styles.th}>
                                        CONDIÇÃO
                                    </th>

                                    <th className={styles.th}>
                                        STATUS
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {machineData.map((item) => (
                                    <tr
                                        key={item.id}
                                        className={styles.tr}
                                    >
                                        <td
                                            className={styles.td}
                                            style={{ fontWeight: 'bold' }}
                                        >
                                            {item.asset_code || 'N/D'}
                                        </td>

                                        <td className={styles.td}>
                                            {item.name || 'Equipamento sem nome'}
                                        </td>

                                        <td className={styles.td}>
                                            {item.category || 'Geral'}
                                        </td>

                                        <td className={styles.td}>
                                            <span className={styles.badgeInfo}>
                                                {item.condition || 'Boa'}
                                            </span>
                                        </td>

                                        <td className={styles.td}>
                                            <span
                                                className={
                                                    isMachineAvailable(item.status)
                                                        ? styles.badgeActive
                                                        : styles.badgeWarning
                                                }
                                            >
                                                {item.status || 'Indefinido'}
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

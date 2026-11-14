import { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import styles from './FilamentReport.module.css';

export function FilamentReport() {
    const [consumptionData, setConsumptionData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFilaments();
    }, []);

    async function fetchFilaments() {
        try {
            setLoading(true);

            const { data, error } = await supabase
                .from('supplies')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            setConsumptionData(data || []);
        } catch (error) {
            console.error('Erro ao buscar dados de filamentos:', error.message);
        } finally {
            setLoading(false);
        }
    }

    const totalImpressions = consumptionData.length;

    const totalGrams = consumptionData.reduce(
        (acc, item) =>
            acc + (Number(item.quantity) || Number(item.weight_grams) || 0),
        0
    );

    return (
        <div className={styles.container}>

            {/* Cabeçalho */}
            <div className={styles.headerRow}>
                <div>
                    <span className={styles.miniCategory}>
                        RELATÓRIOS
                    </span>

                    <h2 className={styles.title}>
                        Relatório de Consumos de Filamentos
                    </h2>

                    <p className={styles.subtitle}>
                        Histórico de uso e gastos de material nas impressões 3D.
                    </p>
                </div>
            </div>

            {/* Cards */}
            <div className={styles.metricGrid}>

                <div className={styles.metricCard}>
                    <span className={styles.metricLabel}>
                        Total Registrado
                    </span>

                    <span className={styles.metricValue}>
                        {totalGrams} g
                    </span>
                </div>

                <div className={styles.metricCard}>
                    <span className={styles.metricLabel}>
                        Itens / Cadastros
                    </span>

                    <span className={styles.metricValue}>
                        {totalImpressions}
                    </span>
                </div>

            </div>

            {/* Dados / Tabela */}
            {loading ? (

                <div className={styles.loadingContainer}>
                    <p className={styles.loadingText}>
                        Carregando dados de consumo...
                    </p>
                </div>

            ) : consumptionData.length === 0 ? (

                <div className={styles.emptyCard}>
                    <p className={styles.emptyTitle}>
                        Nenhum consumo registrado no momento.
                    </p>

                    <p className={styles.emptySubtitle}>
                        Assim que os primeiros insumos ou impressões forem
                        cadastrados, o relatório aparecerá aqui.
                    </p>
                </div>

            ) : (

                <div className={styles.tableCard}>
                    <div className={styles.tableContainer}>

                        <table className={styles.table}>

                            <thead>
                                <tr className={styles.thRow}>
                                    <th className={styles.th}>
                                        MATERIAL / SUPRIMENTO
                                    </th>

                                    <th className={styles.th}>
                                        COR
                                    </th>

                                    <th className={styles.th}>
                                        QUANTIDADE / PESO
                                    </th>

                                    <th className={styles.th}>
                                        STATUS
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {consumptionData.map((item) => (
                                    <tr
                                        key={item.id}
                                        className={styles.tr}
                                    >
                                        <td
                                            className={styles.td}
                                            style={{ fontWeight: 'bold' }}
                                        >
                                            {item.name || 'Material não informado'}
                                        </td>

                                        <td className={styles.td}>
                                            {item.color || 'Não especificada'}
                                        </td>

                                        <td className={styles.td}>
                                            {item.quantity
                                                ? `${item.quantity} g`
                                                : item.weight_grams
                                                    ? `${item.weight_grams} g`
                                                    : 'N/D'}
                                        </td>

                                        <td className={styles.td}>
                                            <span className={styles.badgeInfo}>
                                                {item.status || 'Disponível'}
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

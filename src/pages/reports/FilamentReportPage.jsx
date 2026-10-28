import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { styles } from '../../styles/reportStyles';

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
    const totalGrams = consumptionData.reduce((acc, item) => acc + (Number(item.quantity) || Number(item.weight_grams) || 0), 0);

    return (
        <div style={styles.container}>
            {/* cabeçalho */}
            <div style={styles.headerRow}>
                <div>
                    <span style={styles.miniCategory}>RELATÓRIOS</span>
                    <h2 style={styles.title}>Relatório de Consumos de Filamentos</h2>
                    <p style={styles.subtitle}>Histórico de uso e gastos de material nas impressões 3D.</p>
                </div>
            </div>

            {/* cards */}
            <div style={styles.metricGrid}>
                <div style={styles.metricCard}>
                    <span style={styles.metricLabel}>Total Registrado</span>
                    <span style={styles.metricValue}>{totalGrams} g</span>
                </div>

                <div style={styles.metricCard}>
                    <span style={styles.metricLabel}>Itens / Cadastros</span>
                    <span style={styles.metricValue}>{totalImpressions}</span>
                </div>
            </div>

            {/* dados / tabela */}
            {loading ? (
                <div style={styles.loadingContainer}>
                    <p style={styles.loadingText}>Carregando dados de consumo...</p>
                </div>
            ) : consumptionData.length === 0 ? (
                <div style={styles.emptyCard}>
                    <p style={styles.emptyTitle}>Nenhum consumo registrado no momento.</p>
                    <p style={styles.emptySubtitle}>Assim que os primeiros insumos ou impressões forem cadastrados, o relatório aparecerá aqui.</p>
                </div>
            ) : (
                <div style={styles.tableCard}>
                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.thRow}>
                                    <th style={styles.th}>MATERIAL / SUPRIMENTO</th>
                                    <th style={styles.th}>COR</th>
                                    <th style={styles.th}>QUANTIDADE / PESO</th>
                                    <th style={styles.th}>STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {consumptionData.map((item) => (
                                    <tr key={item.id} style={styles.tr}>
                                        <td style={{ ...styles.td, fontWeight: 'bold' }}>
                                            {item.name || 'Material não informado'}
                                        </td>
                                        <td style={styles.td}>
                                            {item.color || 'Não especificada'}
                                        </td>
                                        <td style={styles.td}>
                                            {item.quantity ? `${item.quantity} g` : (item.weight_grams ? `${item.weight_grams} g` : 'N/D')}
                                        </td>
                                        <td style={styles.td}>
                                            <span style={styles.badgeInfo}>
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
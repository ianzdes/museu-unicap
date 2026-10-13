import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { reportStyles as styles } from '../styles/reportStyles';

export function FilamentReport() {
    const [consumptionData, setConsumptionData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        setLoading(false);
    }, []);

    return (
        <div style={styles.container}>
            {/* cabecalho pagina */}
            <div style={styles.header}>
                <h2 style={styles.title}>Relatório de Consumos de Filamentos</h2>
                <p style={styles.subtitle}>Histórico de uso e gastos de material nas impressões 3D.</p>
            </div>

            {/* cards resumos rapidos */}
            <div style={styles.metricGrid}>
                <div style={styles.metricCard}>
                    <span style={styles.metricLabel}>Total consumido</span>
                    <span style={styles.metricValue}>0 g</span>
                </div>

                <div style={styles.metricCard}>
                        <span style={styles.metricLabel}>Impressões realizadas</span>
                        <span style={styles.metricValue}>0</span>
                </div>
            </div>

            {/* seção dados/tabela */}
            {loading ? (
                <div style={styles.loadingContainer}>
                    <p style={styles.loadingText}>Carregando dados de consumo...</p>
                </div>
            ) : consumptionData.length === 0 ? (
                <div style={styles.emptyCard}>
                    <span style={styles.emptyIcon}>📊</span>
                    <p style={styles.emptyTitle}>Nenhum consumo registrado no momento.</p>
                    <p style={styles.emptySubtitle}>Assim que as primeiras impressões forem cadastradas, o relatório aparecerá aqui.</p>
                </div>
            ) : (
                <div style={styles.tableContainer}>
                    {/* tabela vai ser renderizada aqui futuramente */}
                </div>
            )}
        </div>
    );
}
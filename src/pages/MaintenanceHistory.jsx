import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { reportStyles as styles} from '../styles/reportStyles';

export function MaintenanceHistory() {
    const [maintenanceData, setMaintenanceData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // futuramente dados do supabase aqui
        setLoading(false);
    }, []);

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>Histórico de Manutenções</h2>
                <p style={styles.subtitle}>Acompanhe as manutenções, reparos e revisões dos equipamentos.</p>
            </div>

            <div style={styles.metricGrid}>
                <div style={styles.metricCard}>
                    <span style={styles.metricLabel}>Manutenções Realizadas</span>
                    <span style={styles.metricValue}>0</span>
                </div>

                <div style={styles.metricCard}>
                    <span style={styles.metricLabel}>Em Manutenção</span>
                    <span style={styles.metricValue}>0</span>
                </div>
            </div>

            {loading ? (
                <div style={styles.loadingContainer}>
                    <p style={styles.loadingText}>Carregando histórico de manutenções...</p>
                </div>
            ) : maintenanceData.length === 0 ? (
                <div style={styles.emptyCard}>
                    <span style={styles.emptyIcon}>🔧</span>
                    <p style={styles.emptyTitle}>Nenhuma manutenção registrada no momento.</p>
                    <p style={styles.emptySubtitle}>Assim que os primeiros registros forem cadastrados, eles aparecerão aqui.</p>
                </div>
            ) : (
                <div style={styles.tableContainer}>
                    {/* tabela de manutencoes vai aqui futuramente */}
                </div>
            )}
        </div>
    );
}
import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { styles } from '../../styles/reportStyles';

export function MachineUsage() {

    const [usageData, setUsageData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(false);
    }, []);

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>Relatório do uso de máquinas</h2>
                <p style={styles.subtitle}>Acompanhe o tempo de operação, carga de trabalho e histórico de equipamentos</p>
            </div>

            <div style={styles.metricGrid}>
                <div style={styles.metricCard}>
                    <span style={styles.metricLabel}>Tempo Total de Operação</span>
                    <span style={styles.metricValue}>0h 00m</span>
                </div>

                <div style={styles.metricCard}>
                    <span style={styles.metricLabel}>Total de utilizações</span>
                    <span style={styles.metricValue}>0</span>
                </div>
            </div>

            {loading ? (
                <div style={styles.loadingContainer}>
                    <p style={styles.loadingText}>Carregando dados de uso...</p>
                </div>
                
            ) : usageData.length === 0 ? (
                <div style={styles.emptyCard}>
                    <span style={styles.emptyIcon}>🖨️</span>
                    <p style={styles.emptyTitle}>Nenhum uso de máquina registrado no momento.</p>
                    <p style={styles.emptySubtitle}>Assim que as primeiras operações forem concluídas, elas aparecerão aqui.</p>
                </div>
            ) : (
                <div style={styles.tableContainer}>
                    {/* tabela de registros vai vir aqui futuramente */}
                </div>
            )}
        </div>
    );
}
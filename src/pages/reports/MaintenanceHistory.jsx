import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { styles } from '../../styles/reportStyles';

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
            console.error('Erro ao buscar histórico de manutenções:', error.message);
        } finally {
            setLoading(false);
        }
    }

    // métricas calculadas dinamicamente
    const totalRealizadas = maintenanceData.length;
    const emManutencao = maintenanceData.filter(m => m.type?.toLowerCase() === 'corretiva' || m.status === 'Em Andamento').length;

    return (
        <div style={styles.container}>
            {/* cabeçalho */}
            <div style={styles.headerRow}>
                <div>
                    <span style={styles.miniCategory}>RELATÓRIOS</span>
                    <h2 style={styles.title}>Histórico de Manutenções</h2>
                    <p style={styles.subtitle}>Acompanhe as manutenções, reparos e revisões dos equipamentos.</p>
                </div>
            </div>

            {/* cards de métricas */}
            <div style={styles.metricGrid}>
                <div style={styles.metricCard}>
                    <span style={styles.metricLabel}>Total Registrado</span>
                    <span style={styles.metricValue}>{totalRealizadas}</span>
                </div>

                <div style={styles.metricCard}>
                    <span style={styles.metricLabel}>Em Manutenção / Críticos</span>
                    <span style={styles.metricValue}>{emManutencao}</span>
                </div>
            </div>

            {/* renderização condicional de estados */}
            {loading ? (
                <div style={styles.loadingContainer}>
                    <p style={styles.loadingText}>Carregando histórico de manutenções...</p>
                </div>
            ) : maintenanceData.length === 0 ? (
                <div style={styles.emptyCard}>
                    <p style={styles.emptyTitle}>Nenhuma manutenção registrada no momento.</p>
                    <p style={styles.emptySubtitle}>Assim que os primeiros registros forem cadastrados na tabela, eles aparecerão aqui.</p>
                </div>
            ) : (
                /* tabela */
                <div style={styles.tableCard}>
                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.thRow}>
                                    <th style={styles.th}>EQUIPAMENTO</th>
                                    <th style={styles.th}>TIPO</th>
                                    <th style={styles.th}>TÉCNICO</th>
                                    <th style={styles.th}>DATA</th>
                                    <th style={styles.th}>DESCRIÇÃO</th>
                                </tr>
                            </thead>
                            <tbody>
                                {maintenanceData.map((item) => (
                                    <tr key={item.id} style={styles.tr}>
                                        <td style={{ ...styles.td, fontWeight: 'bold' }}>
                                            {item.equipment_name || 'Equipamento não informado'}
                                        </td>
                                        <td style={styles.td}>
                                            <span style={item.type === 'Preventiva' ? styles.badgeInfo : styles.badgeWarning}>
                                                {item.type || 'Geral'}
                                            </span>
                                        </td>
                                        <td style={styles.td}>{item.technician || 'Não informado'}</td>
                                        <td style={styles.td}>
                                            {item.maintenance_date 
                                                ? new Date(item.maintenance_date).toLocaleDateString('pt-BR') 
                                                : '-'}
                                        </td>
                                        <td style={{ ...styles.td, color: '#64748b' }}>
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
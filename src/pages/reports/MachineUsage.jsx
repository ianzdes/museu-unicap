import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { styles } from '../../styles/reportStyles';

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

    const totalMachines = machineData.length;
    const availableMachines = machineData.filter(m => m.status?.toLowerCase() === 'disponível' || m.status === 'Ativo').length;

    return (
        <div style={styles.container}>
            <div style={styles.headerRow}>
                <div>
                    <span style={styles.miniCategory}>RELATÓRIOS</span>
                    <h2 style={styles.title}>Uso das Máquinas</h2>
                    <p style={styles.subtitle}>Monitore o status operacional, disponibilidade e condição das máquinas e equipamentos.</p>
                </div>
            </div>

            <div style={styles.metricGrid}>
                <div style={styles.metricCard}>
                    <span style={styles.metricLabel}>Total Cadastrado</span>
                    <span style={styles.metricValue}>{totalMachines}</span>
                </div>

                <div style={styles.metricCard}>
                    <span style={styles.metricLabel}>Disponíveis / Operacionais</span>
                    <span style={styles.metricValue}>{availableMachines}</span>
                </div>
            </div>

            {loading ? (
                <div style={styles.loadingContainer}>
                    <p style={styles.loadingText}>Carregando dados de uso das máquinas...</p>
                </div>
            ) : machineData.length === 0 ? (
                <div style={styles.emptyCard}>
                    <p style={styles.emptyTitle}>Nenhuma máquina registrada no momento.</p>
                    <p style={styles.emptySubtitle}>Assim que os primeiros equipamentos forem cadastrados, eles aparecerão aqui.</p>
                </div>
            ) : (
                <div style={styles.tableCard}>
                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.thRow}>
                                    <th style={styles.th}>CÓDIGO / PATRIMÔNIO</th>
                                    <th style={styles.th}>NOME</th>
                                    <th style={styles.th}>CATEGORIA</th>
                                    <th style={styles.th}>CONDIÇÃO</th>
                                    <th style={styles.th}>STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {machineData.map((item) => (
                                    <tr key={item.id} style={styles.tr}>
                                        <td style={{ ...styles.td, fontWeight: 'bold' }}>
                                            {item.asset_code || 'N/D'}
                                        </td>
                                        <td style={styles.td}>
                                            {item.name || 'Equipamento sem nome'}
                                        </td>
                                        <td style={styles.td}>{item.category || 'Geral'}</td>
                                        <td style={styles.td}>
                                            <span style={styles.badgeInfo}>
                                                {item.condition || 'Boa'}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={item.status === 'Disponível' ? styles.badgeActive : styles.badgeWarning}>
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
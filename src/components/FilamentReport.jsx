import { useState, useEffect } from 'react';
import { supabase } from '.supabaseClient';

export function FilamentReport() {
    const [consumptionData, setConsumptionData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        setLoading(false);
    }, []);

    return (
        <div style={styles.container}>
            <h2>Relatório de consumo de filamentos</h2>
            <p>Acompanhamento do uso</p>

            {loading ? (
                <p>Carregando dados...</p>
            ) : (
                <div style={styles.card}>
                    <p>nenhum consumo registrado no momento</p>
                </div>
            )}

        </div>
    );
}

const styles = {
    container: {
        padding: '20px',
        maxWidth: '800px',
        margin: '0 auto',
    },
    card: {
        backgroundColor: '#f9f9f9',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '15px',
        marginTop: '15px',
    }
};
import { useState } from 'react';
import { supabase } from '../supabaseClient';

export function LoanRegister() {
    const [item, setItem] = useState('');
    const [borrower, setBorrower] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (item.trim().length < 2) {
            alert('O nome do item deve ter no mínimo 2 caracteres.');
            return;
        }

        setLoading(true);

        const { error } = await supabase
            .from('loans')
            .insert([
                {
                    item_name: item,
                    borrower_name: borrower,
                    due_date: dueDate || null
                }
            ]);

        setLoading(false);

        if (error) {
            console.error('Erro ao registrar empréstimo:', error.message);
            alert(`Erro ao registrar empréstimo: ${error.message}`);
        } else {
            alert(`Empréstimo de "${item}" registrado com sucesso!`);
            setItem('');
            setBorrower('');
            setDueDate('');
        }
    };

    return (
        <div style={styles.container}>
            <h2>Registrar Empréstimo</h2>
            <form onSubmit={handleSubmit} style={styles.form}>

                <div style={styles.field}>
                    <label style={styles.label}>Item / Obra:</label>
                    <input
                        type="text"
                        value={item}
                        onChange={(e) => setItem(e.target.value)}
                        placeholder="Ex: Livro Raro - Vol. 1"
                        required
                        style={styles.input}
                    />
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>Solicitante / Leitor:</label>
                    <input
                        type="text"
                        value={borrower}
                        onChange={(e) => setBorrower(e.target.value)}
                        placeholder="Ex: João da Silva"
                        required
                        style={styles.input}
                    />
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>Data de Devolução:</label>
                    <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>

                <button type="submit" disabled={loading} style={styles.button}>
                    {loading ? 'Registrando...' : 'Registrar Empréstimo'}
                </button>

            </form>
        </div>
    );
}

const styles = {
    container: {
        maxWidth: '450px',
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        margin: '0 auto',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    },
    field: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
    },
    label: {
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#333',
    },
    input: {
        padding: '8px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        fontSize: '14px',
    },
    button: {
        padding: '10px',
        backgroundColor: '#27ae60',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold',
    },
};
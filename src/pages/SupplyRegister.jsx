import { useState } from 'react';
import { supabase } from '../supabaseClient';

export function SupplyRegister() {
    const [formData, setFormData] = useState({
        name: '',
        type: 'Filamento', // Filamento, Resina, etc.
        color: '',
        quantity: '',
        unit: 'g', // g ou kg
        minStock: ''
    });

    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMessage('');

        try {
            // Futuramente, salvaremos na tabela de suprimentos do Supabase aqui:
            // const { error } = await supabase.from('supplies').insert([formData]);
            // if (error) throw error;

            console.log('Dados do suprimento:', formData);
            setSuccessMessage('Suprimento cadastrado com sucesso!');
            
            // Limpa o formulário
            setFormData({
                name: '',
                type: 'Filamento',
                color: '',
                quantity: '',
                unit: 'g',
                minStock: ''
            });
        } catch (error) {
            console.error('Erro ao cadastrar:', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>Cadastro de Suprimentos</h2>
                <p style={styles.subtitle}>Adicione novos materiais e insumos de impressão 3D ao inventário do museu.</p>
            </div>

            {successMessage && (
                <div style={styles.successAlert}>
                    {successMessage}
                </div>
            )}

            <form onSubmit={handleSubmit} style={styles.formCard}>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Nome do Suprimento / Material</label>
                    <input 
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        placeholder="Ex: PLA Vermelho 1.75mm" 
                        required 
                        style={styles.input}
                    />
                </div>

                <div style={styles.rowGrid}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Tipo de Insumo</label>
                        <select 
                            name="type" 
                            value={formData.type} 
                            onChange={handleChange} 
                            style={styles.input}
                        >
                            <option value="Filamento">Filamento</option>
                            <option value="Resina">Resina</option>
                            <option value="Outro">Outro</option>
                        </select>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Cor</label>
                        <input 
                            type="text" 
                            name="color" 
                            value={formData.color} 
                            onChange={handleChange} 
                            placeholder="Ex: Preto, Azul, Branco" 
                            style={styles.input}
                        />
                    </div>
                </div>

                <div style={styles.rowGrid}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Quantidade Inicial</label>
                        <input 
                            type="number" 
                            name="quantity" 
                            value={formData.quantity} 
                            onChange={handleChange} 
                            placeholder="Ex: 1000" 
                            required 
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Unidade</label>
                        <select 
                            name="unit" 
                            value={formData.unit} 
                            onChange={handleChange} 
                            style={styles.input}
                        >
                            <option value="g">Gramas (g)</option>
                            <option value="kg">Quilogramas (kg)</option>
                            <option value="un">Unidades (un)</option>
                        </select>
                    </div>
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label}>Estoque Mínimo (Alerta)</label>
                    <input 
                        type="number" 
                        name="minStock" 
                        value={formData.minStock} 
                        onChange={handleChange} 
                        placeholder="Ex: 200" 
                        style={styles.input}
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    style={styles.button}
                >
                    {loading ? 'Cadastrando...' : 'Salvar Suprimento'}
                </button>
            </form>
        </div>
    );
}

const styles = {
    container: {
        padding: '20px',
        maxWidth: '700px',
        margin: '0 auto',
    },
    header: {
        marginBottom: '24px',
        borderBottom: '2px solid #edf2f7',
        paddingBottom: '12px',
    },
    title: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1a202c',
        margin: '0 0 6px 0',
    },
    subtitle: {
        fontSize: '14px',
        color: '#718096',
        margin: '0',
    },
    successAlert: {
        backgroundColor: '#c6f6d5',
        color: '#22543d',
        padding: '12px 16px',
        borderRadius: '8px',
        fontSize: '14px',
        marginBottom: '20px',
        border: '1px solid #9ae6b4',
    },
    formCard: {
        backgroundColor: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    rowGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    label: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#4a5568',
    },
    input: {
        padding: '10px 12px',
        borderRadius: '8px',
        border: '1px solid #cbd5e0',
        fontSize: '14px',
        color: '#2d3748',
        outline: 'none',
        fontFamily: 'inherit',
    },
    button: {
        backgroundColor: '#2b6cb0',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        padding: '12px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        marginTop: '10px',
        transition: 'background-color 0.2s',
    }
};
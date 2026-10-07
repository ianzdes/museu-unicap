import { useState } from 'react';
import { supabase } from '../supabaseClient';

export function MachineRegister() {
    const [name, setName] = useState('');
    const [type, setType] = useState('3d_printer');
    const [model, setModel] = useState('');
    const [status, setStatus] = useState('operational'); // 'operacional', 'manutencao', 'fora de servico'
    const [lastMaintenance, setLastMaintenance] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        //validacao basica
        if (name.trim().length < 2) {
            alert('o nome da maquina deve ter no minimo 2 caracteres');
            return;
        }

        // chamada assincrona ao supabase
        const { data, error } = await supabase
            .from('machines')
            .insert([
                {
                    name: name,
                    type: type,
                    model: model,
                    status: status,
                    last_maintenance: lastMaintenance || null
                }
            ]);

        if (error) {
            console.error('erro ao inserir maquina', error.message);
            alert(`erro ao inserir maquina ${error.message}`);
        }
        else {
            alert(`maquina ${name} registrada com sucesso no supabase meu cria`);
        }

        // reseta os campos
        setName('');
        setType('3d_printer');
        setModel('');
        setStatus('operational');
        setLastMaintenance('');
    };

    return (
        <div style={styles.container}>
            <h2>Register Machine</h2>
            <form onSubmit={handleSubmit} style={styles.form}>

                <div style={styles.field}>
                    <label style={styles.label}>Machine name/ id:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Printer Ender 3 - Lab 01"
                        required
                        style={styles.input}
                    />
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>Type:</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        style={styles.input}
                    >
                        <option value="3d_printer">3D Printer</option>
                        <option value="scanner">3D Scanner</option>
                    </select>
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>Model / Brand:</label>
                    <input
                        type="text"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        placeholder="e.g., Creality Ender 3 Pro"
                        required
                        style={styles.input}
                    />
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>Current Status:</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        style={styles.input}
                    >
                        <option value="operational">Operational</option>
                        <option value="maitenance">Maintenance</option>
                        <option value="out_of_service">Out of Service</option>
                    </select>
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>Last preventive maintenance:</label>
                    <input
                        type="date"
                        value={lastMaintenance}
                        onChange={(e) => setLastMaintenance(e.target.value)}
                        style={styles.input}
                    />
                </div>

                <button type="submit" style={styles.button}>
                    Register Machine
                </button>

            </form>
        </div>
    );
}
// estilizacao
const styles = {
    container: {
        maxWidth: '450px',
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
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
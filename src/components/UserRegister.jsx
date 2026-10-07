import { useState } from 'react';

export function UserRegister() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('client');

    const handleSubmit = (e) => {
        e.preventDefault();

        // valida tamanho minimo de nome
        if (name.trim().length < 3) {
            alert("O nome deve ter no mínimo 3 letras!");
            return;
        }

        // validacao email
        const allowedDomain = "@unicap.br";

        if (!email.toLowerCase().endsWith(allowedDomain)) {
            alert(`Apenas emails ${allowedDomain} serão aceitos.`);
            return;
        }

        // se passou por tudo, segue normalmente. depois mudar essa parte daqui de baixo para linkar com o supabase
        const newUser = {
            name,
            email,
            role,
            createdAt: new Date().toISOString()
        };

        console.log("Data to save in Firebase:", newUser);
        alert(`User ${name} registered successfully!`);

        setName('');
        setEmail('');
        setRole('client');
    };

    return (
        <div style={styles.card}>
            <h2>Register User</h2>

            <form onSubmit={handleSubmit} style={styles.form}>
                {/* campo de nome */}
                <div style={styles.fieldGroup}>
                    <label style={styles.label}>Full Name:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        style={styles.input}
                        placeholder="e.g. John Doe"
                    /> 
                </div>

        {/* campo de email */}
        <div style={styles.fieldGroup}>
            <label style={styles.label}>Email Address:</label>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
                placeholder="john@example.com"
            />
        </div>

        <div style={styles.fieldGroup}>
            <label style={styles.label}>User Role:</label>
            <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={styles.input}
            >
                <option value="client">Cliente</option>
                <option value="technician">Técnico</option>
                <option value="admin">Administrador</option>
            </select>
        </div>

        <button type="submit" style={styles.button}>
            Register User
        </button>
    </form>
    </div>
    );
}

const styles = {
    card: {
        maxWidth: '400px',
        margin: '30px auto',
        padding: '24px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        fontFamily: 'sans-serif',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    fieldGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    label: {
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#333',
    },
    input: {
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        fontSize: '14px',
    },
    button: {
        padding: '12px',
        backgroundColor: '#0066cc',
        color: '#ffffff',
        border: 'none',
        borderRadius: '4px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
    }
};
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { styles } from '../styles/reportStyles'; // Reutilizando os estilos padronizados

export function UserSettings() {
    const [userEmail, setUserEmail] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        async function loadUserData() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserEmail(user.email);
                setDisplayName(user.user_metadata?.name || '');
            }
            setLoading(false);
        }
        loadUserData();
    }, []);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            // Atualiza o nome nos metadados do usuário no Supabase Auth
            const { error: updateError } = await supabase.auth.updateUser({
                data: { name: displayName }
            });

            if (updateError) throw updateError;
            setMessage('Perfil atualizado com sucesso!');
        } catch (err) {
            setError('Erro ao atualizar perfil: ' + err.message);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (!newPassword || newPassword.length < 6) {
            setError('A nova senha deve ter pelo menos 6 caracteres.');
            return;
        }

        try {
            const { error: passError } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (passError) throw passError;
            setMessage('Senha alterada com sucesso!');
            setNewPassword('');
        } catch (err) {
            setError('Erro ao alterar senha: ' + err.message);
        }
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <p style={styles.loadingText}>Carregando preferências...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Cabeçalho */}
            <div style={styles.headerRow}>
                <div>
                    <span style={styles.miniCategory}>SISTEMA</span>
                    <h2 style={styles.title}>Preferências do Usuário</h2>
                    <p style={styles.subtitle}>Gerencie suas informações pessoais, dados de acesso e segurança.</p>
                </div>
            </div>

            {/* Mensagens de Feedback */}
            {message && (
                <div style={{ ...styles.badgeActive, marginBottom: '20px', padding: '12px', width: '100%', display: 'block' }}>
                    {message}
                </div>
            )}
            {error && (
                <div style={{ ...styles.badgeInactive, marginBottom: '20px', padding: '12px', width: '100%', display: 'block' }}>
                    {error}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
                
                {/* Card 1: Informações do Perfil */}
                <div style={styles.card} className="preferences-card">
                    <div style={styles.formHeader}>
                        <h3 style={styles.emptyTitle}>Meus Dados</h3>
                    </div>
                    <form onSubmit={handleUpdateProfile} style={styles.form}>
                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>E-mail de Acesso</label>
                            <input 
                                type="email" 
                                value={userEmail} 
                                disabled 
                                style={{ ...styles.input, backgroundColor: '#f1f5f9', cursor: 'not-allowed' }} 
                            />
                            <span style={{ fontSize: '11px', color: '#64748b' }}>O e-mail não pode ser alterado por aqui.</span>
                        </div>

                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Nome de Exibição</label>
                            <input 
                                type="text" 
                                value={displayName} 
                                onChange={(e) => setDisplayName(e.target.value)} 
                                placeholder="Seu nome completo ou apelido"
                                style={styles.input} 
                            />
                        </div>

                        <button type="submit" style={styles.submitButton}>
                            Salvar Alterações
                        </button>
                    </form>
                </div>

                {/* Card 2: Alteração de Senha */}
                <div style={styles.card}>
                    <div style={styles.formHeader}>
                        <h3 style={styles.emptyTitle}>Segurança</h3>
                    </div>
                    <form onSubmit={handleUpdatePassword} style={styles.form}>
                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Nova Senha</label>
                            <input 
                                type="password" 
                                value={newPassword} 
                                onChange={(e) => setNewPassword(e.target.value)} 
                                placeholder="Mínimo de 6 caracteres"
                                style={styles.input} 
                            />
                        </div>

                        <button type="submit" style={{ ...styles.submitButton, backgroundColor: '#4a000d' }}>
                            Atualizar Senha
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}
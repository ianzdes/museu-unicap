import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import styles from './UserSettings.module.css';

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

        if (!newPassword || newPassword.length < 14) {
            setError('A nova senha deve ter pelo menos 14 caracteres.');
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
            <div className={styles.container}>
                <p className={styles.loadingText}>
                    Carregando preferências...
                </p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Cabeçalho */}
            <div className={styles.headerRow}>
                <div>
                    <span className={styles.miniCategory}>
                        SISTEMA
                    </span>

                    <h2 className={styles.title}>
                        Preferências do Usuário
                    </h2>

                    <p className={styles.subtitle}>
                        Gerencie suas informações pessoais, dados de acesso e segurança.
                    </p>
                </div>
            </div>

            {/* Mensagens de retorno */}
            {message && (
                <div className={`${styles.message} ${styles.successMessage}`}>
                    {message}
                </div>
            )}

            {error && (
                <div className={`${styles.message} ${styles.errorMessage}`}>
                    {error}
                </div>
            )}

            {/* Formulários */}
            <div className={styles.settingsGrid}>

                {/* Dados do usuário */}
                <div className={styles.card}>
                    <div className={styles.formHeader}>
                        <h3 className={styles.emptyTitle}>
                            Meus Dados
                        </h3>
                    </div>

                    <form onSubmit={handleUpdateProfile} className={styles.form}>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>
                                E-mail de Acesso
                            </label>

                            <input
                                type="email"
                                value={userEmail}
                                disabled
                                className={styles.input}
                            />

                            <span className={styles.fieldHint}>
                                O e-mail não pode ser alterado por aqui.
                            </span>
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>
                                Nome de Exibição
                            </label>

                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Seu nome completo ou apelido"
                                className={styles.input}
                            />
                        </div>

                        <button
                            type="submit"
                            className={styles.submitButton}
                        >
                            Salvar Alterações
                        </button>
                    </form>
                </div>

                {/* Segurança */}
                <div className={styles.card}>
                    <div className={styles.formHeader}>
                        <h3 className={styles.emptyTitle}>
                            Segurança
                        </h3>
                    </div>

                    <form onSubmit={handleUpdatePassword} className={styles.form}>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>
                                Nova Senha
                            </label>

                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Mínimo de 14 caracteres"
                                className={styles.input}
                            />
                        </div>

                        <button
                            type="submit"
                            className={`${styles.submitButton} ${styles.passwordButton}`}
                        >
                            Atualizar Senha
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}

import { useState } from 'react';
import { supabase } from '../../supabaseClient';
import styles from './Login.module.css';

function loginError(error) {
  if (error.status === 429) return 'Muitas tentativas. Aguarde um pouco antes de tentar novamente.';
  if (error.code === 'invalid_credentials') return 'E-mail ou senha incorretos. Confira os dados e tente novamente.';
  return 'Não foi possível entrar agora. Tente novamente em instantes.';
}

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(event) {
    event.preventDefault();
    if (loading) return;

    const fields = new FormData(event.currentTarget);
    setLoading(true);
    setError('');

    try {
      const { error: failure } = await supabase.auth.signInWithPassword({
        email: String(fields.get('email')).trim(),
        password: String(fields.get('password')),
      });
      if (failure) setError(loginError(failure));
    } catch {
      setError('Não foi possível conectar. Confira sua conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.identity}>
          <div>
            <p className={styles.kicker}>Sistema interno</p>
            <h1>Museu UNICAP</h1>
          </div>
          <div className={styles.archives} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>

        <section className={styles.panel} aria-labelledby="login-title">
          <h2 id="login-title">Entrar no sistema</h2>
          <p className={styles.intro}>Use a conta autorizada pela equipe do museu.</p>

          <form className={styles.form} onSubmit={handleLogin}
            onChange={() => { if (error) setError(''); }}>
            <div className={styles.field}>
              <label htmlFor="login-email">E-mail</label>
              <input id="login-email" name="email" type="email" autoComplete="username"
                autoCapitalize="none" spellCheck={false} readOnly={loading} required />
            </div>

            <div className={styles.field}>
              <label htmlFor="login-password">Senha</label>
              <div className={styles.passwordField}>
                <input id="login-password" name="password" type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password" readOnly={loading} required />
                <button type="button" aria-controls="login-password"
                  onClick={() => setShowPassword(previous => !previous)}>
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                  <span className={styles.srOnly}> senha</span>
                </button>
              </div>
            </div>

            {error && <p className={styles.error} role="alert">{error}</p>}

            <button type="submit" className={styles.submit} disabled={loading}>
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
            <span className={styles.srOnly} role="status">{loading ? 'Verificando seu acesso.' : ''}</span>
          </form>

          <p className={styles.help}>Precisa de acesso? Fale com a equipe do museu.</p>
        </section>
      </div>
    </main>
  );
}
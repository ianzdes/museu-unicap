import { useId, useState } from 'react';
import { supabase } from '../../supabaseClient';
import styles from './UserSettings.module.css';

export function SupportForm() {
    const id = useId();
    const [sending, setSending] = useState(false);
    const [feedback, setFeedback] = useState(null);

    async function handleSubmit(event) {
        event.preventDefault();
        if (sending) return;

        const form = event.currentTarget;
        const data = new FormData(form);
        const message = data.get('message').trim();

        if (!message) {
            setFeedback({ error: true, text: 'Escreva uma mensagem antes de enviar.' });
            return;
        }

        setSending(true);
        setFeedback(null);

        try {
            const { error } = await supabase.from('support_messages').insert({
                category: data.get('category'),
                message,
            });

            if (error) throw error;

            form.reset();
            setFeedback({ error: false, text: 'Mensagem enviada. Obrigado pelo contato!' });
        } catch {
            setFeedback({ error: true, text: 'Não foi possível enviar. Tente novamente.' });
        } finally {
            setSending(false);
        }
    }

    return (
        <section className={styles.card} aria-labelledby={`${id}-title`}>
            <div className={styles.formHeader}>
                <h3 id={`${id}-title`} className={styles.emptyTitle}>Suporte e sugestões</h3>
                <p className={styles.fieldHint}>Envie uma mensagem à equipe do museu para leitura posterior.</p>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor={`${id}-category`}>Assunto</label>
                    <select id={`${id}-category`} name="category" className={styles.input} disabled={sending}>
                        <option value="sugestao">Sugestão</option>
                        <option value="problema">Relatar um problema</option>
                        <option value="mensagem">Outra mensagem</option>
                    </select>
                </div>

                <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor={`${id}-message`}>Mensagem</label>
                    <textarea
                        id={`${id}-message`}
                        name="message"
                        className={`${styles.input} ${styles.supportTextarea}`}
                        aria-describedby={`${id}-hint`}
                        rows={4}
                        maxLength={2000}
                        required
                        disabled={sending}
                    />
                    <span id={`${id}-hint`} className={styles.fieldHint}>Até 2.000 caracteres.</span>
                </div>

                <button type="submit" className={styles.submitButton} disabled={sending}>
                    {sending ? 'Enviando…' : 'Enviar mensagem'}
                </button>

                {feedback && (
                    <div
                        role={feedback.error ? 'alert' : 'status'}
                        className={`${styles.message} ${feedback.error ? styles.errorMessage : styles.successMessage}`}
                    >
                        {feedback.text}
                    </div>
                )}
            </form>
        </section>
    );
}
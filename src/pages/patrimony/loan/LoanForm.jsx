import { useId, useLayoutEffect, useRef, useState } from 'react';
import { dateField, loanPayload, todayAtMuseum } from './LoanFields';
import styles from './LoanRegister.module.css';

function initialFields(loan) {
  return {
    equipment_name: loan?.equipment_name ?? '',
    client_name: loan?.client_name ?? '',
    loan_date: loan ? dateField(loan.loan_date) : todayAtMuseum(),
    due_date: dateField(loan?.due_date),
    status: loan?.status === 'Devolvido' ? 'Devolvido' : 'Ativo',
    notes: loan?.notes ?? '',
  };
}

export function LoanForm({ loan, draft, onDraft, onSave, onDelete, onClose }) {
  const editing = loan != null;
  const titleId = useId();
  const dialog = useRef(null);
  const nameInput = useRef(null);
  const [fields, setFields] = useState(() => draft ?? initialFields(loan));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  useLayoutEffect(() => {
    const element = dialog.current;
    const opener = document.activeElement;
    element?.showModal();
    nameInput.current?.focus();
    return () => {
      element?.close();
      opener?.focus();
    };
  }, []);

  function change({ target: { name, value } }) {
    const next = { ...fields, [name]: value };
    setFields(next);
    onDraft?.(next);
    setError('');
  }

  async function run(operation) {
    if (pending) return;
    setPending(true);
    setError('');
    try {
      await operation();
    } catch (failure) {
      setError(failure.message || 'A operação falhou. Tente novamente.');
    } finally {
      setPending(false);
    }
  }

  function submit(event) {
    event.preventDefault();
    void run(() => onSave(loanPayload(fields, loan)));
  }

  function remove() {
    if (window.confirm('Excluir este registro de empréstimo?')) {
      void run(onDelete);
    }
  }

  const form = (
    <form onSubmit={submit}>
      <fieldset disabled={pending} className={styles.fields}>
        <label>
          Equipamento / Patrimônio
          <input ref={nameInput} name="equipment_name" value={fields.equipment_name}
            onChange={change} required minLength={2} />
        </label>
        <label>
          Cliente / Solicitante
          <input name="client_name" value={fields.client_name} onChange={change} required minLength={2} />
        </label>
        {!editing && <label>
          Data de retirada
          <input name="loan_date" type="date" value={fields.loan_date} onChange={change} required />
        </label>}
        <label>
          Data prevista de devolução
          <input name="due_date" type="date" value={fields.due_date} onChange={change}
            min={fields.loan_date || undefined} required={!editing} />
        </label>
        {editing && <label>
          Situação
          <select name="status" value={fields.status} onChange={change}>
            <option value="Ativo">Em aberto</option>
            <option value="Devolvido">Devolvido</option>
          </select>
        </label>}
        <label>
          Observações (opcional)
          <input name="notes" value={fields.notes} onChange={change} />
        </label>
        <div className={editing ? styles.modalFooter : styles.formActions}>
          {editing && <>
            <button type="button" className={styles.deleteButton} onClick={remove}>Excluir</button>
            <button type="button" className={styles.secondaryButton} onClick={onClose}>Cancelar</button>
          </>}
          <button type="submit" className={styles.primaryButton}>
            {editing ? 'Salvar alterações' : 'Registrar empréstimo'}
          </button>
        </div>
      </fieldset>
      {pending && <p role="status">Processando…</p>}
      {error && <p className={styles.error} role="alert">{error}</p>}
    </form>
  );

  if (editing) {
    return (
      <dialog ref={dialog} className={styles.dialog} aria-labelledby={titleId}
        onCancel={event => {
          event.preventDefault();
          if (!pending) onClose();
        }}>
        <header className={styles.formHeader}>
          <h3 id={titleId}>Gerenciar empréstimo</h3>
          <button type="button" className={styles.textButton} aria-label="Fechar"
            disabled={pending} onClick={onClose}>✕</button>
        </header>
        {form}
      </dialog>
    );
  }

  return (
    <section className={styles.card} aria-labelledby={titleId}>
      <header className={styles.formHeader}>
        <h2 id={titleId}>Novo empréstimo</h2>
        <button type="button" className={styles.textButton}
          disabled={pending} onClick={onClose}>← Voltar para a lista</button>
      </header>
      {form}
    </section>
  );
}
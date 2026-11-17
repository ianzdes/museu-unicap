import { useId, useLayoutEffect, useRef, useState } from 'react';
import { CATEGORIES, CONDITIONS, STATUSES, machinePayload } from './MachineFields';
import styles from './MachineRegister.module.css';

const SELECT_FIELDS = [
  ['category', 'Categoria', CATEGORIES],
  ['condition', 'Condição', CONDITIONS],
  ['status', 'Situação', STATUSES],
];

function initialFields(machine) {
  return {
    asset_code: '',
    name: machine?.name ?? '',
    category: machine?.category || CATEGORIES[0],
    condition: machine?.condition || 'Boa',
    status: machine?.status || STATUSES[0],
    last_maintenance: '',
    supply_level: '100',
  };
}

export function MachineForm({ machine, draft, onDraft, onSave, onDelete, onClose }) {
  const editing = machine != null;
  const titleId = useId();
  const dialog = useRef(null);
  const nameInput = useRef(null);
  const [fields, setFields] = useState(() => draft ?? initialFields(machine));
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
    void run(() => onSave(machinePayload(fields, editing)));
  }

  function remove() {
    if (window.confirm(`Tem certeza que deseja excluir o equipamento ${machine.name}?`)) {
      void run(onDelete);
    }
  }

  const form = (
    <form onSubmit={submit}>
      <fieldset disabled={pending} className={styles.fields}>
        {!editing && <label>
          Código de patrimônio
          <input name="asset_code" value={fields.asset_code} onChange={change}
            placeholder="Deixe em branco para gerar automaticamente" />
        </label>}
        <label>
          Nome do equipamento
          <input ref={nameInput} name="name" value={fields.name} onChange={change}
            required minLength={2} placeholder="Ex. Impressora 3D Ender 3" />
        </label>
        {SELECT_FIELDS.map(([name, label, options]) => (
          <label key={name}>
            {label}
            <select name={name} value={fields[name]} onChange={change}>
              {!options.includes(fields[name]) && <option>{fields[name]}</option>}
              {options.map(option => <option key={option}>{option}</option>)}
            </select>
          </label>
        ))}
        {!editing && <>
          <label>
            Última manutenção
            <input name="last_maintenance" type="date" value={fields.last_maintenance} onChange={change} />
          </label>
          <label>
            Nível de insumo
            <input name="supply_level"
              value={fields.supply_level} onChange={change} placeholder="Ex. 80% ou 500g" />
          </label>
        </>}
        <div className={editing ? styles.modalFooter : styles.formActions}>
          {editing && <>
            <button type="button" className={styles.deleteButton} onClick={remove}>Excluir</button>
            <button type="button" className={styles.secondaryButton} onClick={onClose}>Cancelar</button>
          </>}
          <button type="submit" className={styles.primaryButton}>
            {editing ? 'Salvar alterações' : 'Salvar equipamento'}
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
          <h3 id={titleId}>Gerenciar equipamento</h3>
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
        <h2 id={titleId}>Novo equipamento</h2>
        <button type="button" className={styles.textButton}
          disabled={pending} onClick={onClose}>← Voltar para a lista</button>
      </header>
      {form}
    </section>
  );
}
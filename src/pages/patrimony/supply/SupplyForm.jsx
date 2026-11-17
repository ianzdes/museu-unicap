import { useLayoutEffect, useId, useRef, useState } from 'react';
import { MATERIALS, STOCK, STOCK_OPTIONS, automaticStatus, supplyPayload } from './SupplyFields.jsx';
import styles from './SupplyRegister.module.css';

function initialFields(supply) {
  return {
    name: supply?.name ?? '',
    material: supply?.material || 'PLA',
    color: supply?.color ?? '',
    purchase_kg: supply?.purchase_kg ?? '1',
    current_stock_grams: supply ? (supply.current_stock_grams ?? '') : '1000',
    status: STOCK_OPTIONS.includes(supply?.status) ? supply.status : STOCK.available,
  };
}

export function SupplyForm({ supply, draft, onDraft, onSave, onDelete, onClose }) {
  const editing = supply != null;
  const titleId = useId();
  const dialog = useRef(null);
  const [fields, setFields] = useState(() => draft ?? initialFields(supply));
  const [pending, setPending] = useState('');
  const [error, setError] = useState('');
  const fixedStatus = automaticStatus(fields.current_stock_grams);

  useLayoutEffect(() => {
    const element = dialog.current;
    if (!element) return;
    const opener = document.activeElement;
    element.showModal();
    element.querySelector('[name="name"]').focus();
    return () => {
      element.close();
      opener?.focus();
    };
  }, []);

  function change({ target: { name, value } }) {
    const next = { ...fields, [name]: value };
    if (name === 'purchase_kg') {
      next.current_stock_grams = value === '' ? '' : String(Math.round(Number(value) * 1000));
    }
    setFields(next);
    onDraft?.(next);
    setError('');
  }

  async function run(action, operation) {
    if (pending) return;
    setError('');
    setPending(action);
    try {
      await operation();
    } catch (failure) {
      setError(failure.message || 'A operação falhou. Tente novamente.');
    } finally {
      setPending('');
    }
  }

  function submit(event) {
    event.preventDefault();
    void run('save', () => onSave(supplyPayload(fields, editing)));
  }

  function remove() {
    if (window.confirm(`Tem certeza que deseja excluir o insumo ${supply.name}?`)) {
      void run('delete', onDelete);
    }
  }

  const form = (
    <form onSubmit={submit}>
      <fieldset disabled={Boolean(pending)} className={styles.fields}>
        <label>
          Nome do Suprimento / Filamento
          <input name="name" value={fields.name} onChange={change} required minLength={2}
            placeholder="Ex. Filamento PLA Premium 1.75 mm" />
        </label>
        <label>
          Tipo de Material
          <select name="material" value={fields.material} onChange={change}>
            {!MATERIALS.some(([value]) => value === fields.material) &&
              <option value={fields.material}>{fields.material}</option>}
            {MATERIALS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label>
          Cor / Acabamento
          <input name="color" value={fields.color} onChange={change}
            placeholder="Ex. Preto, Branco, Transparente" />
        </label>
        {!editing && (
          <label>
            Quantidade comprada (kg)
            <input name="purchase_kg" type="number" min="0" step="0.1"
              value={fields.purchase_kg} onChange={change} required />
          </label>
        )}
        <label>
          Estoque atual (g)
          <input name="current_stock_grams" type="number" min="0" step="1"
            value={fields.current_stock_grams} onChange={change} required />
        </label>
        <label>
          Situação do estoque
          <select name="status" value={fixedStatus ?? fields.status} onChange={change}
            disabled={fixedStatus != null}>
            {STOCK_OPTIONS.map(status => <option key={status}>{status}</option>)}
          </select>
        </label>
        <div className={editing ? styles.modalFooter : styles.formActions}>
          {editing && <>
            <button type="button" className={styles.deleteButton} onClick={remove}>
              {pending === 'delete' ? 'Excluindo…' : 'Excluir'}
            </button>
            <button type="button" className={styles.secondaryButton} onClick={onClose}>Cancelar</button>
          </>}
          <button type="submit" className={styles.primaryButton}>
            {pending === 'save' ? 'Salvando…' : editing ? 'Salvar alterações' : 'Salvar insumo'}
          </button>
        </div>
      </fieldset>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <span className={styles.srOnly} role="status">
        {pending === 'save' && 'Salvando insumo'}
        {pending === 'delete' && 'Excluindo insumo'}
      </span>
    </form>
  );

  if (!editing) {
    return (
      <section className={styles.card} aria-labelledby={titleId}>
        <header className={styles.formHeader}>
          <h2 id={titleId}>Novo suprimento / insumo</h2>
          <button type="button" className={styles.textButton} onClick={onClose}
            disabled={Boolean(pending)}>← Voltar para a lista</button>
        </header>
        {form}
      </section>
    );
  }

  return (
    <dialog ref={dialog} className={styles.dialog} aria-labelledby={titleId}
      onCancel={event => {
        event.preventDefault();
        if (!pending) onClose();
      }}>
      <header className={styles.formHeader}>
        <h3 id={titleId}>Gerenciar insumo</h3>
        <button type="button" className={styles.textButton} aria-label="Fechar"
          disabled={Boolean(pending)} onClick={onClose}>✕</button>
      </header>
      {form}
    </dialog>
  );
}
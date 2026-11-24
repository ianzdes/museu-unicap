import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { supabase } from '../../supabaseClient';
import styles from './Registry.module.css';

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo' });
const nameField = { key: 'name', label: 'Nome completo', minLength: 3, autoComplete: 'name' };

export function formatDate(value, fallback = '—') {
  if (!value) return fallback;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value.split('-').reverse().join('/');
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : dateFormatter.format(date);
}

export function Badge({ tone = 'neutral', children }) {
  return <span className={styles.badge} data-tone={tone}>{children}</span>;
}

async function loadRows(config, signal) {
  const rows = [];
  let total = Infinity;
  while (!signal.aborted && rows.length < total) {
    const { data, count, error } = await supabase.from(config.table)
      .select(config.select, rows.length ? undefined : { count: 'exact' })
      .order('created_at', { ascending: false }).order('id')
      .range(rows.length, rows.length + 499).abortSignal(signal);
    if (error) throw error;
    if (!data?.length) break;
    rows.push(...data);
    total = count ?? total;
  }
  return rows;
}

function RegistryForm({ config, selected, draft, onDraft, onSave, onDelete, onClose }) {
  const editing = selected != null;
  const headingId = useId();
  const dialog = useRef(null);
  const firstInput = useRef(null);
  const [values, setValues] = useState(() => selected ?? draft ?? config.defaults);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const title = editing ? `Gerenciar ${config.item}` : `Novo ${config.item}`;

  useLayoutEffect(() => {
    const modal = dialog.current;
    const opener = document.activeElement;
    modal?.showModal();
    firstInput.current?.focus();
    return () => {
      modal?.close();
      opener?.focus();
    };
  }, []);

  function change({ target: { name, value } }) {
    const next = { ...values, [name]: value };
    setValues(next);
    if (!editing) onDraft(next);
    setError('');
  }

  async function run(action) {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (failure) {
      setError(failure.message || 'A operação falhou. Tente novamente.');
    } finally {
      setBusy(false);
    }
  }

  const form = (
    <form onSubmit={event => {
      event.preventDefault();
      void run(() => {
        const name = values.name?.trim();
        if (!name || name.length < 3) throw new Error('Informe um nome com pelo menos 3 caracteres.');
        return onSave(config.payload({ ...values, name }, editing));
      });
    }}>
      <fieldset className={styles.fields} disabled={busy}>
        {[nameField, ...config.fields].filter(field => field.mode == null ||
          field.mode === (editing ? 'edit' : 'create')).map(field => {
          const fallback = config.defaults[field.key] ?? '';
          const value = field.options ? (values[field.key] || fallback) : (values[field.key] ?? fallback);
          return (
            <label key={field.key}>
              {field.label}
              {field.options ? (
                <select name={field.key} value={value} onChange={change}>
                  {!Object.hasOwn(field.options, value) && <option value={value}>{value}</option>}
                  {Object.entries(field.options).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                </select>
              ) : (
                <input ref={field.key === 'name' ? firstInput : undefined} name={field.key}
                  type={field.type || 'text'} value={value} onChange={change}
                  autoComplete={field.autoComplete} minLength={field.minLength} required />
              )}
            </label>
          );
        })}
        <div className={styles.actions}>
          {editing && <>
            <button type="button" className={styles.danger} onClick={() => {
              if (window.confirm(`Excluir ${selected.name}?`)) void run(onDelete);
            }}>Excluir</button>
            <button type="button" onClick={onClose}>Cancelar</button>
          </>}
          <button type="submit" className={styles.primary}>{editing ? 'Salvar alterações' : 'Salvar cadastro'}</button>
        </div>
      </fieldset>
      {busy && <p role="status">Processando…</p>}
      {error && <p role="alert" className={styles.error}>{error}</p>}
    </form>
  );

  if (editing) {
    return (
      <dialog ref={dialog} className={styles.dialog} aria-labelledby={headingId} onCancel={event => {
        event.preventDefault();
        if (!busy) onClose();
      }}>
        <header className={styles.heading}>
          <h3 id={headingId}>{title}</h3>
          <button type="button" aria-label="Fechar" onClick={onClose} disabled={busy}>✕</button>
        </header>
        {form}
      </dialog>
    );
  }

  return (
    <section className={styles.formCard} aria-labelledby={headingId}>
      <header className={styles.heading}>
        <h2 id={headingId}>{title}</h2>
        <button type="button" onClick={onClose} disabled={busy}>← Voltar para a lista</button>
      </header>
      {form}
    </section>
  );
}

export function Registry({ config }) {
  const [result, setResult] = useState({ loading: true });
  const [revision, setRevision] = useState(0);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(null);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [notice, setNotice] = useState('');
  const newButton = useRef(null);
  const restoreFocus = useRef(false);
  const titleId = useId();

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    loadRows(config, signal).then(
      rows => { if (!signal.aborted) setResult({ rows }); },
      () => { if (!signal.aborted) setResult({ error: true }); },
    );
    return () => controller.abort();
  }, [config, revision]);

  useLayoutEffect(() => {
    if (!creating && !selected && restoreFocus.current) {
      restoreFocus.current = false;
      newButton.current?.focus();
    }
  }, [creating, selected]);

  function reload() {
    setResult({ loading: true });
    setRevision(previous => previous + 1);
  }

  function closeCreation() {
    restoreFocus.current = true;
    setCreating(false);
  }

  async function finish(request, success) {
    const { error } = await request;
    if (error) throw new Error('Não foi possível concluir a operação. Confira os dados e tente novamente.');
    setNotice(success);
    reload();
  }

  if (creating) {
    return <RegistryForm config={config} draft={draft} onDraft={setDraft} onClose={closeCreation}
      onSave={async payload => {
        await finish(supabase.from(config.table).insert(payload), 'Cadastro salvo com sucesso.');
        setDraft(null);
        closeCreation();
      }} />;
  }

  const query = search.trim().toLowerCase();
  const rows = (result.rows ?? []).filter(row =>
    config.searchFields.some(key => String(row[key] ?? '').toLowerCase().includes(query)) &&
    config.filters.every(({ key }) => !filters[key] || config.filterValue(row, key) === filters[key]),
  );
  const columns = ['Nº', 'Nome', ...config.columns.map(([label]) => label), 'Ações'];

  return (
    <section className={styles.container} aria-labelledby={titleId}>
      <header className={styles.heading}>
        <div>
          <span className={styles.category}>{config.category}</span>
          <h2 id={titleId}>{config.title}</h2>
          <p className={styles.subtitle}>{config.subtitle}</p>
        </div>
        <button ref={newButton} type="button" className={styles.primary} onClick={() => {
          setNotice('');
          setCreating(true);
        }}>+ Novo {config.item}</button>
      </header>

      {notice && <p className={styles.notice} role="status">{notice}</p>}
      <div className={styles.tableCard}>
        <div className={styles.filters}>
          <input type="search" aria-label={config.searchLabel} placeholder={config.searchLabel}
            value={search} onChange={event => setSearch(event.target.value)} />
          {config.filters.map(({ key, label, options }) => (
            <select key={key} aria-label={label} value={filters[key] ?? ''}
              onChange={event => setFilters({ ...filters, [key]: event.target.value })}>
              <option value="">{label} · todos</option>
              {Object.entries(options).map(([value, text]) => <option key={value} value={value}>{text}</option>)}
            </select>
          ))}
        </div>

        {result.loading && <p role="status" className={styles.message}>Carregando…</p>}
        {result.error && <div className={styles.message}>
          <p role="alert" className={styles.error}>Não foi possível carregar os registros.</p>
          <button type="button" onClick={reload}>Tentar novamente</button>
        </div>}
        {result.rows && (
          <div className={styles.tableScroll} role="region" aria-label={`Tabela de ${config.title.toLowerCase()}`} tabIndex={0}>
            <table className={styles.table} aria-labelledby={titleId}>
              <thead><tr>{columns.map(label => <th key={label} scope="col">{label}</th>)}</tr></thead>
              <tbody>
                {!rows.length && <tr><td colSpan={columns.length} className={styles.message}>Nenhum registro encontrado.</td></tr>}
                {rows.map((row, index) => (
                  <tr key={row.id}>
                    <td>{index + 1}</td>
                    <th scope="row">{row.name || '—'}</th>
                    {config.columns.map(([label, render]) => <td key={label}>{render(row)}</td>)}
                    <td><button type="button" aria-label={`Gerenciar ${row.name}`} onClick={() => setSelected(row)}>
                      Gerenciar
                    </button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && <RegistryForm config={config} selected={selected} onClose={() => setSelected(null)}
        onSave={async payload => {
          await finish(supabase.from(config.table).update(payload).eq('id', selected.id).select('id').single(),
            'Cadastro atualizado com sucesso.');
          restoreFocus.current = true;
          setSelected(null);
        }}
        onDelete={async () => {
          await finish(supabase.from(config.table).delete().eq('id', selected.id).select('id').single(),
            'Cadastro excluído com sucesso.');
          restoreFocus.current = true;
          setSelected(null);
        }} />}
    </section>
  );
}
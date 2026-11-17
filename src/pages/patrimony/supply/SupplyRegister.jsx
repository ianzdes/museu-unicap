import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { supabase } from '../../../supabaseClient';
import { SupplyForm } from './SupplyForm';
import { MATERIALS, STOCK, STOCK_OPTIONS, stockStatus } from './SupplyFields.jsx';
import styles from './SupplyRegister.module.css';

const COLUMNS = ['Nº', 'Insumo / Filamento', 'Material', 'Cor', 'Compra (kg)',
'Estoque atual (g)', 'Status', 'Ações'];
const BADGE_CLASS = {
  [STOCK.available]: styles.badgeActive,
  [STOCK.low]: styles.badgeWarning,
  [STOCK.empty]: styles.badgeInactive,
};

async function loadSupplies(signal) {
  const rows = [];
  const pageSize = 500;
  let total = Infinity;
  while (!signal.aborted && rows.length < total) {
    const { data, error, count } = await supabase
      .from('supplies')
      .select('id,name,material,color,purchase_kg,current_stock_grams,status',
        rows.length === 0 ? { count: 'exact' } : undefined)
      .order('created_at', { ascending: false })
      .order('id')
      .range(rows.length, rows.length + pageSize - 1)
      .abortSignal(signal);

    if (error) throw error;
    if (!data?.length) break;
    total = count ?? total;
    rows.push(...data);
  }
  return rows;
}

export function SupplyRegister() {
  const [supplies, setSupplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [revision, setRevision] = useState(0);
  const [search, setSearch] = useState('');
  const [material, setMaterial] = useState('');
  const [status, setStatus] = useState('');
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(null);
  const [selected, setSelected] = useState(null);
  const [notice, setNotice] = useState('');
  const newButton = useRef(null);
  const restoreListFocus = useRef(false);

  useLayoutEffect(() => {
    if (!creating && !selected && restoreListFocus.current) {
      restoreListFocus.current = false;
      newButton.current?.focus();
    }
  }, [creating, selected]);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    loadSupplies(signal).then(
      rows => {
        if (signal.aborted) return;
        setSupplies(rows);
        setLoading(false);
      },
      () => {
        if (signal.aborted) return;
        setLoadError(true);
        setLoading(false);
      },
    );
    return () => controller.abort();
  }, [revision]);

  function refresh() {
    setLoading(true);
    setLoadError(false);
    setRevision(value => value + 1);
  }

  async function mutate(request, failure, success) {
    const { error } = await request;
    if (error) throw new Error(`${failure} ${error.message}`);
    setNotice(success);
    refresh();
  }

  function closeCreation() {
    restoreListFocus.current = true;
    setCreating(false);
  }

  if (creating) {
    return (
      <SupplyForm draft={draft} onDraft={setDraft} onClose={closeCreation}
        onSave={async payload => {
          await mutate(supabase.from('supplies').insert([payload]),
            'Erro ao registrar insumo.', 'Insumo cadastrado com sucesso.');
          setDraft(null);
          closeCreation();
        }} />
    );
  }

  const query = search.trim().toLowerCase();
  const rows = supplies.map(item => ({
    ...item, displayStatus: item.current_stock_grams == null && !STOCK_OPTIONS.includes(item.status)
      ? null : stockStatus(item.current_stock_grams, item.status),
  })).filter(item =>
    (!material || item.material === material) &&
    (!status || item.displayStatus === status) &&
    (!query || [item.name, item.color, item.material]
      .some(value => value?.toLowerCase().includes(query))),
  );

  return (
    <section className={styles.container}>
      <header className={styles.headerRow}>
        <div>
          <span className={styles.miniCategory}>ESTOQUE &amp; INSUMOS</span>
          <h2 className={styles.title}>Suprimentos de impressão</h2>
          <p className={styles.subtitle}>Gerencie rolos de filamento, resinas e consumo fracionado.</p>
        </div>
        <button ref={newButton} type="button" className={styles.primaryButton} onClick={() => {
          setNotice('');
          setCreating(true);
        }}>+ Novo insumo</button>
      </header>

      <p className={notice ? styles.notice : styles.srOnly} role="status">{notice}</p>
      <div className={styles.tableCard}>
        <div className={styles.filterBar}>
          <input type="search" aria-label="Pesquisar por nome, cor ou material"
            placeholder="Pesquisar por nome, cor ou material…" value={search}
            onChange={event => setSearch(event.target.value)} />
          <select aria-label="Filtrar por material" value={material}
            onChange={event => setMaterial(event.target.value)}>
            <option value="">Material: todos</option>
            {MATERIALS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <select aria-label="Filtrar por status" value={status}
            onChange={event => setStatus(event.target.value)}>
            <option value="">Status: todos</option>
            {STOCK_OPTIONS.map(option => <option key={option}>{option}</option>)}
          </select>
        </div>

        {loading && <p className={styles.tableMessage} role="status">Carregando insumos…</p>}
        {loadError && (
          <div className={styles.tableMessage}>
            <p className={styles.error} role="alert">Não foi possível carregar os insumos.</p>
            <button type="button" className={styles.secondaryButton} onClick={refresh}>
              Tentar novamente
            </button>
          </div>
        )}
        {!loading && !loadError && (
          <div className={styles.tableScroll} role="region" aria-label="Tabela de insumos" tabIndex={0}>
            <table className={styles.table} aria-label="Suprimentos de impressão">
              <thead>
                <tr>{COLUMNS.map(column => <th key={column} scope="col">{column}</th>)}</tr>
              </thead>
              <tbody>
                {!rows.length && <tr><td colSpan={COLUMNS.length} className={styles.tableMessage}>
                  Nenhum insumo encontrado.
                </td></tr>}
                {rows.map((item, index) => (
                  <tr key={item.id}>
                    <td>#{String(index + 1).padStart(3, '0')}</td>
                    <td>{item.name}</td>
                    <td>{item.material || '—'}</td>
                    <td>{item.color || '—'}</td>
                    <td className={item.purchase_kg < 0 ? styles.error : undefined}>
                      {item.purchase_kg ?? '—'}
                    </td>
                    <td className={item.current_stock_grams < 0 ? styles.error : undefined}>
                      <strong>{item.current_stock_grams ?? '—'}</strong>
                    </td>
                    <td><span className={`${styles.badge} ${BADGE_CLASS[item.displayStatus] ?? ''}`}>
                      {item.displayStatus ?? 'Não informado'}
                    </span></td>
                    <td><button type="button" className={styles.secondaryButton}
                      aria-label={`Gerenciar ${item.name}`} onClick={() => setSelected(item)}>
                      Gerenciar
                    </button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && <SupplyForm supply={selected} onClose={() => setSelected(null)}
        onSave={async payload => {
          await mutate(supabase.from('supplies').update(payload).eq('id', selected.id).select('id').single(),
            'Erro ao atualizar insumo.', 'Insumo atualizado com sucesso.');
          restoreListFocus.current = true;
          setSelected(null);
        }}
        onDelete={async () => {
          await mutate(supabase.from('supplies').delete().eq('id', selected.id).select('id').single(),
            'Erro ao excluir insumo.', 'Insumo excluído com sucesso.');
          restoreListFocus.current = true;
          setSelected(null);
        }} />}
    </section>
  );
}
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { supabase } from '../../../supabaseClient';
import { MachineForm } from './MachineForm';
import { CATEGORIES, CONDITIONS, STATUSES, formatMaintenance, formatSupplyLevel } from './MachineFields';
import styles from './MachineRegister.module.css';

const COLUMNS = ['Patrimônio', 'Equipamento', 'Categoria', 'Condição', 'Situação',
  'Última manutenção', 'Insumo', 'Ações'];
const FILTERS = [
  ['category', 'Categoria', CATEGORIES],
  ['status', 'Situação', STATUSES],
  ['condition', 'Condição', CONDITIONS],
];
const BADGES = new Map([
  ['Disponível', styles.badgeActive],
  ['Emprestado', styles.badgeInfo],
  ['Manutenção', styles.badgeWarning],
]);

async function loadMachines(signal) {
  const rows = [];
  const pageSize = 500;
  let total = Infinity;
  while (!signal.aborted && rows.length < total) {
    const { data, error, count } = await supabase
      .from('equipments')
      .select('id,asset_code,name,category,condition,status,last_maintenance,supply_level',
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

export function MachineRegister() {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [revision, setRevision] = useState(0);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ category: '', status: '', condition: '' });
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
    loadMachines(signal).then(
      rows => {
        if (signal.aborted) return;
        setMachines(rows);
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
      <MachineForm draft={draft} onDraft={setDraft} onClose={closeCreation}
        onSave={async payload => {
          await mutate(supabase.from('equipments').insert([payload]),
            'Erro ao registrar equipamento.', 'Equipamento cadastrado com sucesso.');
          setDraft(null);
          closeCreation();
        }} />
    );
  }

  const query = search.trim().toLowerCase();
  const rows = machines.filter(item =>
    FILTERS.every(([field]) => !filters[field] || item[field] === filters[field]) &&
    (!query || [item.name, item.asset_code, item.category]
      .some(value => value?.toLowerCase().includes(query))),
  );

  return (
    <section className={styles.container}>
      <header className={styles.headerRow}>
        <div>
          <span className={styles.miniCategory}>PATRIMÔNIO</span>
          <h2 className={styles.title}>Máquinas</h2>
          <p className={styles.subtitle}>Consulte a disponibilidade e a condição dos equipamentos.</p>
        </div>
        <button ref={newButton} type="button" className={styles.primaryButton} onClick={() => {
          setNotice('');
          setCreating(true);
        }}>+ Novo equipamento</button>
      </header>

      <p className={notice ? styles.notice : styles.srOnly} role="status">{notice}</p>
      <div className={styles.tableCard}>
        <div className={styles.filterBar}>
          <input type="search" aria-label="Pesquisar por nome, patrimônio ou categoria"
            placeholder="Pesquisar por nome, patrimônio ou categoria…" value={search}
            onChange={event => setSearch(event.target.value)} />
          {FILTERS.map(([field, label, options]) => (
            <select key={field} aria-label={`Filtrar por ${label.toLowerCase()}`}
              value={filters[field]}
              onChange={event => setFilters({ ...filters, [field]: event.target.value })}>
              <option value="">{label}: todas</option>
              {options.map(option => <option key={option}>{option}</option>)}
            </select>
          ))}
        </div>

        {loading && <p className={styles.tableMessage} role="status">Carregando equipamentos…</p>}
        {loadError && (
          <div className={styles.tableMessage}>
            <p className={styles.error} role="alert">Não foi possível carregar os equipamentos.</p>
            <button type="button" className={styles.secondaryButton} onClick={refresh}>
              Tentar novamente
            </button>
          </div>
        )}
        {!loading && !loadError && (
          <div className={styles.tableScroll} role="region" aria-label="Tabela de equipamentos" tabIndex={0}>
            <table className={styles.table} aria-label="Máquinas">
              <thead>
                <tr>{COLUMNS.map(column => <th key={column} scope="col">{column}</th>)}</tr>
              </thead>
              <tbody>
                {!rows.length && <tr><td colSpan={COLUMNS.length} className={styles.tableMessage}>
                  Nenhum equipamento encontrado.
                </td></tr>}
                {rows.map(item => (
                  <tr key={item.id}>
                    <td>{item.asset_code || '—'}</td>
                    <td>{item.name}</td>
                    <td>{item.category || '—'}</td>
                    <td>{item.condition || '—'}</td>
                    <td>
                      <span className={`${styles.badge} ${BADGES.get(item.status) ?? ''}`}>
                        {item.status || 'Não informado'}
                      </span>
                    </td>
                    <td>{formatMaintenance(item.last_maintenance)}</td>
                    <td>{formatSupplyLevel(item.supply_level)}</td>
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

      {selected && <MachineForm machine={selected} onClose={() => setSelected(null)}
        onSave={async payload => {
          await mutate(supabase.from('equipments').update(payload).eq('id', selected.id).select('id').single(),
            'Erro ao atualizar equipamento.', 'Equipamento atualizado com sucesso.');
          restoreListFocus.current = true;
          setSelected(null);
        }}
        onDelete={async () => {
          await mutate(supabase.from('equipments').delete().eq('id', selected.id).select('id').single(),
            'Erro ao excluir equipamento.', 'Equipamento excluído com sucesso.');
          restoreListFocus.current = true;
          setSelected(null);
        }} />}
    </section>
  );
}
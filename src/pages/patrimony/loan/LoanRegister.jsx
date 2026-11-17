import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { supabase } from '../../../supabaseClient';
import { LoanForm } from './LoanForm';
import { STATUSES, displayLoanStatus, formatLoanDate, returnPayload, todayAtMuseum } from './LoanFields';
import styles from './LoanRegister.module.css';

const COLUMNS = ['Nº', 'Equipamento', 'Cliente', 'Retirada', 'Previsão de devolução',
  'Devolução', 'Status', 'Ações'];
const BADGES = {
  Ativo: styles.badgeInfo,
  Devolvido: styles.badgeActive,
  Atrasado: styles.badgeInactive,
};

function matchStatus(request, loan) {
  return loan.status == null ? request.is('status', null) : request.eq('status', loan.status);
}

async function loadLoans(signal) {
  const rows = [];
  const pageSize = 500;
  let total = Infinity;
  while (!signal.aborted && rows.length < total) {
    const { data, error, count } = await supabase
      .from('loans')
      .select('id,equipment_name,client_name,loan_date,due_date,return_date,status,notes',
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

export function LoanRegister() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [revision, setRevision] = useState(0);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [today, setToday] = useState(todayAtMuseum);
  const [returning, setReturning] = useState(false);
  const [actionError, setActionError] = useState('');
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(null);
  const [selected, setSelected] = useState(null);
  const [notice, setNotice] = useState('');
  const newButton = useRef(null);
  const restoreListFocus = useRef(false);

  useLayoutEffect(() => {
    if (!creating && !selected && !returning && restoreListFocus.current) {
      restoreListFocus.current = false;
      newButton.current?.focus();
    }
  }, [creating, selected, returning]);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    loadLoans(signal).then(
      rows => {
        if (signal.aborted) return;
        setLoans(rows);
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

  useEffect(() => {
    const update = () => setToday(todayAtMuseum());
    const timer = window.setInterval(update, 30_000);
    window.addEventListener('focus', update);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', update);
    };
  }, []);

  function refresh() {
    setLoading(true);
    setLoadError(false);
    setRevision(value => value + 1);
  }

  async function mutate(request, failure, success) {
    const { error } = await request;
    if (error) throw new Error(`${failure} ${error.message}`);
    setActionError('');
    setNotice(success);
    refresh();
  }

  function closeCreation() {
    restoreListFocus.current = true;
    setCreating(false);
  }

  async function registerReturn(loan) {
    if (returning || !window.confirm('Confirmar a devolução deste equipamento?')) return;

    setReturning(true);
    setNotice('');
    setActionError('');
    try {
      const request = supabase.from('loans').update(returnPayload(loan)).eq('id', loan.id);
      await mutate(matchStatus(request, loan).select('id').single(),
        'Erro ao registrar devolução.', 'Devolução registrada com sucesso.');
      restoreListFocus.current = true;
    } catch (error) {
      setActionError(error.message || 'Não foi possível registrar a devolução.');
    } finally {
      setReturning(false);
    }
  }

  if (creating) {
    return (
      <LoanForm draft={draft} onDraft={setDraft} onClose={closeCreation}
        onSave={async payload => {
          await mutate(supabase.from('loans').insert([payload]),
            'Erro ao registrar empréstimo.', 'Empréstimo cadastrado com sucesso.');
          setDraft(null);
          closeCreation();
        }} />
    );
  }

  const query = search.trim().toLowerCase();
  const rows = loans.map(loan => ({ loan, status: displayLoanStatus(loan, today) }))
    .filter(({ loan, status }) =>
      (!filter || status === filter) &&
      (!query || [loan.equipment_name, loan.client_name]
        .some(value => value?.toLowerCase().includes(query))),
    );

  return (
    <section className={styles.container}>
      <header className={styles.headerRow}>
        <div>
          <span className={styles.miniCategory}>CIRCULAÇÃO &amp; EMPRÉSTIMOS</span>
          <h2 className={styles.title}>Empréstimos de equipamentos</h2>
          <p className={styles.subtitle}>Acompanhe retiradas, prazos e devoluções.</p>
        </div>
        <button ref={newButton} type="button" className={styles.primaryButton} disabled={returning} onClick={() => {
          setNotice('');
          setActionError('');
          setCreating(true);
        }}>+ Novo empréstimo</button>
      </header>

      <p className={notice ? styles.notice : styles.srOnly} role="status">{notice}</p>
      {returning && <p role="status">Registrando devolução…</p>}
      {actionError && <p className={styles.error} role="alert">{actionError}</p>}
      <div className={styles.tableCard}>
        <div className={styles.filterBar}>
          <input type="search" aria-label="Pesquisar por equipamento ou cliente"
            placeholder="Pesquisar por equipamento ou cliente…" value={search}
            onChange={event => setSearch(event.target.value)} />
          <select aria-label="Filtrar por status" value={filter}
            onChange={event => setFilter(event.target.value)}>
            <option value="">Status: todos</option>
            {STATUSES.map(status => <option key={status}>{status}</option>)}
          </select>
        </div>

        {loading && <p className={styles.tableMessage} role="status">Carregando empréstimos…</p>}
        {loadError && (
          <div className={styles.tableMessage}>
            <p className={styles.error} role="alert">Não foi possível carregar os empréstimos.</p>
            <button type="button" className={styles.secondaryButton} onClick={refresh}>
              Tentar novamente
            </button>
          </div>
        )}
        {!loading && !loadError && (
          <div className={styles.tableScroll} role="region" aria-label="Tabela de empréstimos" tabIndex={0}>
            <table className={styles.table} aria-label="Empréstimos de equipamentos">
              <thead>
                <tr>{COLUMNS.map(column => <th key={column} scope="col">{column}</th>)}</tr>
              </thead>
              <tbody>
                {!rows.length && <tr><td colSpan={COLUMNS.length} className={styles.tableMessage}>
                  Nenhum empréstimo encontrado.
                </td></tr>}
                {rows.map(({ loan, status }, index) => (
                  <tr key={loan.id}>
                    <td>#{String(index + 1).padStart(3, '0')}</td>
                    <td>{loan.equipment_name}</td>
                    <td>{loan.client_name}</td>
                    <td>{formatLoanDate(loan.loan_date)}</td>
                    <td>{formatLoanDate(loan.due_date)}</td>
                    <td>{formatLoanDate(loan.return_date)}</td>
                    <td><span className={`${styles.badge} ${BADGES[status]}`}>{status}</span></td>
                    <td>
                      <div className={styles.actions}>
                        {status !== 'Devolvido' && (
                          <button type="button" className={styles.returnButton} disabled={returning}
                            aria-label={`Dar baixa em ${loan.equipment_name}`}
                            onClick={() => registerReturn(loan)}>Dar baixa</button>
                        )}
                        <button type="button" className={styles.secondaryButton} disabled={returning}
                          aria-label={`Gerenciar ${loan.equipment_name}`}
                          onClick={() => setSelected(loan)}>Gerenciar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && <LoanForm loan={selected} onClose={() => setSelected(null)}
        onSave={async payload => {
          const request = supabase.from('loans').update(payload).eq('id', selected.id);
          await mutate(matchStatus(request, selected).select('id').single(),
            'Erro ao atualizar empréstimo.', 'Empréstimo atualizado com sucesso.');
          restoreListFocus.current = true;
          setSelected(null);
        }}
        onDelete={async () => {
          await mutate(supabase.from('loans').delete().eq('id', selected.id).select('id').single(),
            'Erro ao excluir empréstimo.', 'Empréstimo excluído com sucesso.');
          restoreListFocus.current = true;
          setSelected(null);
        }} />}
    </section>
  );
}
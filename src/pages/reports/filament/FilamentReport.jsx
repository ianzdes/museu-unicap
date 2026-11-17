import { useEffect, useId, useMemo, useState } from 'react';
import { supabase } from '../../../supabaseClient';
import {
  buildReport, formatDate, formatMonth, formatPercent, formatVariation, formatWeight,
  museumDate, summarizeMachines,
} from './FilamentReportData';
import styles from './FilamentReport.module.css';

const BADGES = {
  'Em Estoque': styles.badgeActive,
  'Baixo Estoque': styles.badgeWarning,
  Esgotado: styles.badgeInactive,
  'Saldo inválido': styles.badgeInactive,
};

async function fetchAll(makeQuery, signal) {
  const rows = [];
  let total = Infinity;
  while (!signal.aborted && rows.length < total) {
    const { data, error, count } = await makeQuery(rows.length ? undefined : { count: 'exact' })
      .range(rows.length, rows.length + 499).abortSignal(signal);
    if (error) throw error;
    if (!data?.length) break;
    rows.push(...data);
    total = count ?? total;
  }
  return rows;
}

function loadReport(signal) {
  return Promise.all([
    fetchAll(options => supabase.from('productions')
      .select('id,production_date,created_at,description,technician_name,equipment_name,supply_grams', options)
      .gt('supply_grams', 0)
      .order('production_date', { ascending: false })
      .order('created_at', { ascending: false })
      .order('id'), signal),
    fetchAll(options => supabase.from('supplies')
      .select('id,name,material,color,current_stock_grams,status', options)
      .order('name').order('id'), signal),
  ]);
}

function ReportTable({ title, headers, children, footer, controls }) {
  const headingId = useId();
  return (
    <section className={styles.card} aria-labelledby={headingId}>
      <header className={styles.sectionHeader}>
        <h3 id={headingId}>{title}</h3>
        {controls}
      </header>
      <div className={styles.tableScroll} tabIndex={0} role="region" aria-labelledby={headingId}>
        <table className={styles.table} aria-labelledby={headingId}>
          <thead><tr>{headers.map(header => <th key={header} scope="col">{header}</th>)}</tr></thead>
          <tbody>{children}</tbody>
          {footer && <tfoot>{footer}</tfoot>}
        </table>
      </div>
    </section>
  );
}

function WeightBar({ grams, maximum }) {
  return (
    <div className={styles.weight}>
      <strong>{formatWeight(grams)}</strong>
      <div className={styles.bar} aria-hidden="true">
        <span style={{ width: `${grams / maximum * 100}%` }} />
      </div>
    </div>
  );
}

function ReportContent({ productions, supplies }) {
  const [monthFilter, setMonthFilter] = useState('');
  const report = useMemo(() => buildReport(productions, supplies), [productions, supplies]);
  const { months, stock } = report;
  const visible = useMemo(() => monthFilter
    ? report.rows.filter(row => row.month === monthFilter)
    : report.rows, [report.rows, monthFilter]);
  const machines = useMemo(() => summarizeMachines(visible), [visible]);
  const visibleTotal = machines.reduce((sum, machine) => sum + machine.total, 0);
  const currentMonth = museumDate().slice(0, 7);
  const monthTotal = months.find(month => month.key === currentMonth)?.total ?? 0;
  const monthMaximum = months.reduce((maximum, month) => Math.max(maximum, month.total), 1);
  const period = monthFilter ? formatMonth(monthFilter) : 'todos os meses';
  const metrics = [
    ['Consumo neste mês', monthTotal],
    ['Média dos meses com consumo', report.monthlyAverage],
    ['Total consumido', report.total],
    ['Estoque atual', report.stockTotal,
      `${report.lowStock} com estoque baixo ou esgotado${report.omittedStock
        ? ` · ${report.omittedStock} sem saldo válido no total` : ''}`],
  ];

  return (
    <>
      <dl className={styles.metrics}>
        {metrics.map(([label, value, hint]) => (
          <div key={label} className={styles.card}>
            <dt>{label}</dt>
            <dd>{formatWeight(value)}</dd>
            {hint && <dd className={styles.hint}>{hint}</dd>}
          </div>
        ))}
      </dl>

      {!months.length ? (
        <p className={styles.card}>Nenhuma produção com consumo registrado.</p>
      ) : (
        <>
          <ReportTable title="Consumo por mês"
            headers={['Mês', 'Consumo', 'Produções com insumo', 'Média por produção', 'Vs. mês anterior']}>
            {months.map(month => (
              <tr key={month.key} className={monthFilter === month.key ? styles.selected : undefined}>
                <th scope="row">
                  <button type="button" className={styles.button} aria-pressed={monthFilter === month.key}
                    onClick={() => setMonthFilter(current => current === month.key ? '' : month.key)}>
                    {formatMonth(month.key)}
                  </button>
                </th>
                <td><WeightBar grams={month.total} maximum={monthMaximum} /></td>
                <td>{month.count}</td>
                <td>{formatWeight(month.total / month.count)}</td>
                <td>{formatVariation(month.total, month.previous)}</td>
              </tr>
            ))}
          </ReportTable>

          <ReportTable title={`Consumo por máquina (${period})`}
            headers={['Máquina', 'Consumo', 'Produções', '% do período']}
            controls={
              <div className={styles.controls}>
                <select aria-label="Filtrar por mês" value={monthFilter}
                  onChange={event => setMonthFilter(event.target.value)}>
                  <option value="">Mês: todos</option>
                  {months.map(month => <option key={month.key} value={month.key}>{formatMonth(month.key)}</option>)}
                </select>
                <button type="button" className={styles.button} disabled={!monthFilter}
                  onClick={() => setMonthFilter('')}>Limpar filtro</button>
              </div>
            }
            footer={
              <tr>
                <th scope="row">Total</th>
                <td>{formatWeight(visibleTotal)}</td>
                <td>{visible.length}</td>
                <td>{formatPercent(visibleTotal > 0 ? 1 : null)}</td>
              </tr>
            }>
            {machines.map(machine => (
              <tr key={machine.key}>
                <th scope="row">{machine.key}</th>
                <td><WeightBar grams={machine.total} maximum={machines[0].total} /></td>
                <td>{machine.count}</td>
                <td>{formatPercent(machine.total / visibleTotal)}</td>
              </tr>
            ))}
          </ReportTable>

          <ReportTable title={`Produções com consumo (${visible.length})`}
            headers={['Data', 'Descrição', 'Técnico', 'Máquina', 'Consumo']}>
            {visible.map(item => (
              <tr key={item.id}>
                <td className={styles.nowrap}>{formatDate(item.date)}</td>
                <td className={styles.description}>{item.description || '—'}</td>
                <td>{item.technician_name || '—'}</td>
                <td>{item.equipment_name || '—'}</td>
                <td className={styles.nowrap}>{formatWeight(item.grams)}</td>
              </tr>
            ))}
          </ReportTable>
        </>
      )}

      <ReportTable title="Situação atual do estoque" headers={['Insumo', 'Material', 'Cor', 'Estoque atual', 'Status']}>
        {!stock.length && <tr><td colSpan={5}>Nenhum insumo cadastrado.</td></tr>}
        {stock.map(item => (
          <tr key={item.id}>
            <th scope="row">{item.name || '—'}</th>
            <td>{item.material || '—'}</td>
            <td>{item.color || '—'}</td>
            <td className={styles.nowrap}>{formatWeight(item.grams)}</td>
            <td><span className={`${styles.badge} ${BADGES[item.label] ?? styles.badgeInfo}`}>{item.label}</span></td>
          </tr>
        ))}
      </ReportTable>
    </>
  );
}

export function FilamentReport() {
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    loadReport(controller.signal).then(
      result => { if (!controller.signal.aborted) setData(result); },
      () => {
        if (controller.signal.aborted) return;
        setFailed(true);
        controller.abort();
      },
    );
    return () => controller.abort();
  }, [attempt]);

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <span className={styles.miniCategory}>RELATÓRIOS</span>
        <h2>Consumo mensal de estoque</h2>
        <p>Acompanhe o consumo de filamento e resina e o saldo dos insumos.</p>
      </header>
      {failed ? (
        <div className={styles.card}>
          <p role="alert">Não foi possível carregar o relatório.</p>
          <button type="button" className={styles.button} onClick={() => {
            setFailed(false);
            setAttempt(value => value + 1);
          }}>Tentar novamente</button>
        </div>
      ) : data ? (
        <ReportContent productions={data[0]} supplies={data[1]} />
      ) : (
        <p className={styles.card} role="status">Carregando dados de consumo…</p>
      )}
    </section>
  );
}
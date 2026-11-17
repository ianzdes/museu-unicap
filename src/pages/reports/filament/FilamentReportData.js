const NO_DATE = 'sem-data';
const calendar = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
});
const monthFormat = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'UTC', month: 'long', year: 'numeric',
});
const gramFormat = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });
const percentFormat = new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 1 });

export function museumDate(date = new Date()) {
  const parts = Object.fromEntries(calendar.formatToParts(date).map(({ type, value }) => [type, value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function calendarDate(value) {
  const day = /^(\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01]))(?:$|T| )/.exec(value ?? '')?.[1];
  if (!day) return '';
  const parsed = new Date(`${day}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === day ? day : '';
}

function productionDate(item) {
  const explicitDate = calendarDate(item.production_date);
  if (explicitDate) return explicitDate;
  const createdDate = calendarDate(item.created_at);
  if (!createdDate || item.created_at === createdDate) return createdDate;
  const timestamp = new Date(item.created_at);
  return Number.isNaN(timestamp.getTime()) ? createdDate : museumDate(timestamp);
}

export function formatDate(day) {
  return day ? day.split('-').reverse().join('/') : '—';
}

export function formatMonth(key) {
  if (key === NO_DATE) return 'Sem data';
  const label = monthFormat.format(new Date(`${key}-01T00:00:00Z`));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatWeight(grams) {
  if (grams == null) return '—';
  if (Math.abs(grams) >= 1000) return `${gramFormat.format(grams / 1000)} kg`;
  return `${gramFormat.format(grams)} g`;
}

export function formatPercent(ratio) {
  return ratio == null ? '—' : percentFormat.format(ratio);
}

export function formatVariation(total, previous) {
  if (!previous) return '—';
  const ratio = (total - previous) / previous;
  if (Math.abs(ratio) < 0.0005) return '0%';
  return `${ratio > 0 ? '+' : ''}${formatPercent(ratio)}`;
}

function groupConsumption(rows, getKey) {
  const groups = new Map();
  for (const row of rows) {
    const key = getKey(row);
    const group = groups.get(key) ?? { key, total: 0, count: 0 };
    group.total += row.grams;
    group.count += 1;
    groups.set(key, group);
  }
  return groups;
}

function previousMonth(key) {
  if (key === NO_DATE) return null;
  const date = new Date(`${key}-01T00:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() - 1);
  return date.toISOString().slice(0, 7);
}

function numericWeight(value) {
  if (value == null || String(value).trim() === '') return null;
  const weight = Number(value);
  return Number.isFinite(weight) ? weight : null;
}

function stockStatus(item, grams) {
  if (grams < 0 || (grams == null && item.current_stock_grams != null)) return 'Saldo inválido';
  if (grams === 0) return 'Esgotado';
  if (grams > 0 && grams <= 200) return 'Baixo Estoque';
  if (['Em Estoque', 'Baixo Estoque', 'Esgotado'].includes(item.status)) return item.status;
  return grams == null ? 'Não informado' : 'Em Estoque';
}

export function buildReport(productions, supplies) {
  const rows = productions.map(item => {
    const date = productionDate(item);
    return { ...item, date, month: date.slice(0, 7) || NO_DATE, grams: numericWeight(item.supply_grams) };
  }).filter(row => row.grams > 0).sort((a, b) => b.date.localeCompare(a.date));

  const groups = groupConsumption(rows, row => row.month);
  const months = [...groups.values()]
    .sort((a, b) => (a.key === NO_DATE) - (b.key === NO_DATE) || b.key.localeCompare(a.key))
    .map(month => ({ ...month, previous: groups.get(previousMonth(month.key))?.total }));

  const dated = months.filter(month => month.key !== NO_DATE);
  const stock = supplies.map(item => {
    const grams = numericWeight(item.current_stock_grams);
    return { ...item, grams, label: stockStatus(item, grams) };
  });
  const validStock = stock.filter(item => item.grams != null && item.grams >= 0);

  return {
    rows, months, stock,
    monthlyAverage: dated.length
      ? dated.reduce((sum, month) => sum + month.total, 0) / dated.length
      : null,
    total: months.reduce((sum, month) => sum + month.total, 0),
    stockTotal: validStock.length || !stock.length
      ? validStock.reduce((sum, item) => sum + item.grams, 0)
      : null,
    omittedStock: stock.length - validStock.length,
    lowStock: stock.filter(item => ['Baixo Estoque', 'Esgotado'].includes(item.label)).length,
  };
}

export function summarizeMachines(rows) {
  return [...groupConsumption(rows, item => item.equipment_name?.trim() || 'Não informada').values()]
    .sort((a, b) => b.total - a.total);
}
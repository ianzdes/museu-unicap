export const STATUSES = ['Ativo', 'Devolvido', 'Atrasado'];

const museumCalendar = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Sao_Paulo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function todayAtMuseum(now = new Date()) {
  const parts = Object.fromEntries(museumCalendar.formatToParts(now).map(({ type, value }) => [type, value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function dateField(value) {
  return /^(\d{4}-\d{2}-\d{2})(?:$|T| )/.exec(value ?? '')?.[1] ?? '';
}

export function formatLoanDate(value) {
  const date = dateField(value);
  return date ? date.split('-').reverse().join('/') : '—';
}

export function displayLoanStatus(loan, today) {
  if (loan.status === 'Devolvido') return 'Devolvido';
  const dueDate = dateField(loan.due_date);
  return dueDate && dueDate < today ? 'Atrasado' : 'Ativo';
}

export function returnPayload(loan, today = todayAtMuseum()) {
  if (today < dateField(loan.loan_date)) {
    throw new Error('A devolução não pode ocorrer antes da retirada.');
  }
  return { status: 'Devolvido', return_date: today };
}

export function loanPayload(fields, loan) {
  const equipmentName = fields.equipment_name.trim();
  const clientName = fields.client_name.trim();
  if (equipmentName.length < 2) throw new Error('Informe o nome ou patrimônio do equipamento.');
  if (clientName.length < 2) throw new Error('Informe o nome do cliente ou solicitante.');

  const loanDate = fields.loan_date;
  const dueDate = fields.due_date;
  if (!loan && (!loanDate || !dueDate)) throw new Error('Informe as datas de retirada e devolução prevista.');
  if (loanDate && dueDate && dueDate < loanDate) {
    throw new Error('A devolução prevista não pode ser anterior à retirada.');
  }

  const common = {
    equipment_name: equipmentName,
    client_name: clientName,
    due_date: dueDate || null,
    notes: fields.notes.trim() || null,
  };

  if (!loan) return { ...common, loan_date: loanDate, status: 'Ativo' };
  if (fields.status !== 'Devolvido') return { ...common, status: 'Ativo', return_date: null };
  if (loan.status === 'Devolvido') return { ...common, status: 'Devolvido' };
  return { ...common, ...returnPayload(loan) };
}
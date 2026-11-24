import { Badge, Registry, formatDate } from '../Registry';

const TYPES = { Aluno: 'Aluno', Visitante: 'Visitante' };
const typeOf = row => row.type || 'Aluno';

const config = {
  table: 'clients',
  select: 'id,name,contact,type,created_at,last_loan',
  item: 'cliente',
  title: 'Clientes',
  category: 'ATENDIMENTO',
  subtitle: 'Cadastros de alunos e visitantes atendidos pelo museu.',
  searchLabel: 'Pesquisar por nome ou contato',
  searchFields: ['name', 'contact'],
  defaults: { name: '', contact: '', type: 'Aluno' },
  fields: [
    { key: 'contact', label: 'Contato (telefone ou WhatsApp)', type: 'tel', autoComplete: 'tel', minLength: 8 },
    { key: 'type', label: 'Tipo de cliente', options: TYPES },
  ],
  filters: [{ key: 'type', label: 'Tipo de cliente', options: TYPES }],
  filterValue: typeOf,
  columns: [
    ['Contato', row => row.contact || '—'],
    ['Data de registro', row => formatDate(row.created_at)],
    ['Último empréstimo', row => formatDate(row.last_loan)],
    ['Tipo', row => <Badge tone={typeOf(row) === 'Visitante' ? 'info' : 'positive'}>{typeOf(row)}</Badge>],
  ],
  payload({ name, contact, type }, editing) {
    const trimmedContact = contact?.trim();
    if (!trimmedContact || trimmedContact.length < 8) {
      throw new Error('Informe um contato com pelo menos 8 caracteres.');
    }
    const data = { name, contact: trimmedContact, type: type || 'Aluno' };
    return editing ? data : { ...data, last_loan: null };
  },
};

export function ClientRegister() {
  return <Registry config={config} />;
}
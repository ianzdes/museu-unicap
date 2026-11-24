import { Badge, Registry, formatDate } from '../Registry';

const ROLES = { client: 'Cliente', technician: 'Técnico', admin: 'Administrador' };
const STATUSES = { Ativo: 'Ativo', Inativo: 'Inativo' };
const roleOf = row => row.role || 'client';
const statusOf = row => row.status || 'Ativo';

const config = {
  table: 'profiles',
  select: 'id,name,email,role,status,last_access',
  item: 'usuário',
  title: 'Usuários',
  category: 'ACESSOS',
  subtitle: 'Gerencie os perfis internos e acompanhe o último acesso.',
  searchLabel: 'Pesquisar por nome ou e-mail',
  searchFields: ['name', 'email'],
  defaults: { name: '', email: '', role: 'client', status: 'Ativo' },
  fields: [
    { key: 'email', label: 'E-mail institucional (@unicap.br)', type: 'email', autoComplete: 'email', mode: 'create' },
    { key: 'role', label: 'Perfil', options: ROLES },
    { key: 'status', label: 'Status', options: STATUSES, mode: 'edit' },
  ],
  filters: [
    { key: 'role', label: 'Perfil', options: ROLES },
    { key: 'status', label: 'Status', options: STATUSES },
  ],
  filterValue: (row, key) => key === 'role' ? roleOf(row) : statusOf(row),
  columns: [
    ['Perfil', row => Object.hasOwn(ROLES, roleOf(row)) ? ROLES[roleOf(row)] : roleOf(row)],
    ['Status', row => <Badge tone={statusOf(row) === 'Ativo' ? 'positive' : 'negative'}>{statusOf(row)}</Badge>],
    ['Último acesso', row => formatDate(row.last_access, 'Nunca')],
  ],
  payload({ name, email, role, status }, editing) {
    if (editing) return { name, role: role || 'client', status: status || 'Ativo' };
    const normalizedEmail = email?.trim().toLowerCase();
    if (!/^[^@\s]+@unicap\.br$/.test(normalizedEmail ?? '')) {
      throw new Error('Informe um e-mail institucional do domínio @unicap.br.');
    }
    return { name, email: normalizedEmail, role, status: 'Ativo', last_access: new Date().toISOString() };
  },
};

export function UserRegister() {
  return <Registry config={config} />;
}
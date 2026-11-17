export const CATEGORIES = ['Eletrônico', 'Digitalização', 'Audiovisual', 'Impressão 3D'];
export const CONDITIONS = ['Excelente', 'Boa', 'Regular', 'Ruim'];
export const STATUSES = ['Disponível', 'Emprestado', 'Manutenção'];

export function machinePayload(fields, editing) {
  const name = fields.name.trim();
  if (name.length < 2) throw new Error('O nome deve ter pelo menos 2 caracteres.');

  const common = { name, category: fields.category, condition: fields.condition, status: fields.status };
  if (editing) return common;

  return {
    ...common,
    asset_code: fields.asset_code.trim() || generateAssetCode(),
    last_maintenance: fields.last_maintenance || null,
    supply_level: parseSupplyLevel(fields.supply_level),
  };
}

function parseSupplyLevel(value) {
  if (!value.trim()) return 'N/A';

  const parts = /^(\d+(?:[.,]\d+)?)\s*(%|g)?$/i.exec(value.trim());
  if (!parts) throw new Error('Informe uma porcentagem (ex. 80%) ou um peso em gramas (ex. 500g).');

  const quantity = Number(parts[1].replace(',', '.'));
  const inGrams = parts[2]?.toLowerCase() === 'g';
  if (!Number.isFinite(quantity) || (!inGrams && quantity > 100)) {
    throw new Error('Informe uma porcentagem entre 0 e 100% ou um peso válido em gramas.');
  }

  return inGrams ? `${quantity}g` : quantity;
}

function generateAssetCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  const suffix = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  return `PAT-${suffix.toUpperCase()}`;
}

export function formatMaintenance(value) {
  const parts = /^(\d{4})-(\d{2})-(\d{2})(?:$|T| )/.exec(value ?? '');
  return parts ? `${parts[3]}/${parts[2]}/${parts[1]}` : '—';
}

export function formatSupplyLevel(value) {
  if (value == null || String(value).trim() === '') return '—';
  return Number.isFinite(Number(value)) ? `${value}%` : value;
}
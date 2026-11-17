export const MATERIALS = [
  ['PLA', 'PLA'],
  ['ABS', 'ABS'],
  ['PETG', 'PETG'],
  ['Resina', 'Resina (SLA)'],
  ['Outro', 'Outro'],
];

export const STOCK = {
  available: 'Em Estoque',
  low: 'Baixo Estoque',
  empty: 'Esgotado',
};

export const STOCK_OPTIONS = Object.values(STOCK);

export function automaticStatus(grams) {
  if (grams == null || grams === '') return null;
  if (grams <= 0) return STOCK.empty;
  if (grams <= 200) return STOCK.low;
  return null;
}

export function stockStatus(grams, status) {
  return automaticStatus(grams) ?? (STOCK_OPTIONS.includes(status) ? status : STOCK.available);
}

function readQuantity(value, label) {
  const number = Number(value);
  if (value == null || String(value).trim() === '' || !Number.isFinite(number) || number < 0) {
    throw new Error(`${label}: informe um número maior ou igual a zero.`);
  }
  return number;
}

export function supplyPayload(fields, isEditing) {
  const name = fields.name.trim();
  if (name.length < 2) throw new Error('O nome do insumo deve ter no mínimo 2 caracteres.');

  const grams = readQuantity(fields.current_stock_grams, 'Estoque atual');
  if (!Number.isInteger(grams)) throw new Error('Informe o estoque em gramas inteiras.');

  return {
    name,
    material: fields.material,
    color: fields.color.trim() || (isEditing ? '' : 'Padrão'),
    current_stock_grams: grams,
    status: stockStatus(grams, fields.status),
    ...(isEditing ? {} : { purchase_kg: readQuantity(fields.purchase_kg, 'Quantidade comprada') }),
  };
}
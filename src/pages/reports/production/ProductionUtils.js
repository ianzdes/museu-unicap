// formatacoes, totais, validacao e conversao para o banco
// Funções e constantes compartilhadas pelo relatório de produção.
// Não tem JSX nem estado: só entra um valor e sai outro.

export const TYPE_PRINT = 'Impressão 3D';
export const TYPE_SCAN = 'Digitalização';

/* ===================== Datas ===================== */

// Data de hoje no fuso local, em "YYYY-MM-DD" (o formato en-CA já é esse)
const todayISO = () => new Date().toLocaleDateString('en-CA');

// "2026-11-05" -> "05/11/2026"
export const formatDate = (date) => date.split('-').reverse().join('/');

// Produção -> "2026-11" (mês dela)
export const getMonthKey = (item) => item.production_date.slice(0, 7);

// "2026-11" -> "Novembro de 2026" (ou "nov/2026" com short = true)
export function formatMonth(key, short = false) {
    const [year, month] = key.split('-').map(Number);
    const date = new Date(year, month - 1, 1);

    if (short) {
        return `${date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}/${year}`;
    }

    const label = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    return label.charAt(0).toUpperCase() + label.slice(1);
}

/* ===================== Formatação de valores ===================== */

// 1250 -> "1.250 g"
export const formatSupply = (grams) => `${Number(grams).toLocaleString('pt-BR')} g`;

// 150 -> "2h 30min"
export function formatDuration(minutes) {
    const total = Math.round(minutes);
    if (!total) return '—';

    const h = Math.floor(total / 60);
    const m = total % 60;

    if (h === 0) return `${m} min`;
    return m === 0 ? `${h}h` : `${h}h ${String(m).padStart(2, '0')}min`;
}

/* ===================== Totais e listas ===================== */

const sumBy = (list, field) => list.reduce((sum, item) => sum + (Number(item[field]) || 0), 0);

// Totais de uma lista de produções
export function summarize(list) {
    return {
        total: list.length,
        prints: list.filter((p) => p.production_type === TYPE_PRINT).length,
        scans: list.filter((p) => p.production_type === TYPE_SCAN).length,
        supply: sumBy(list, 'supply_grams'),
        minutes: sumBy(list, 'production_minutes'),
    };
}

// Meses com dados, do mais recente para o mais antigo
export const uniqueMonths = (list) => Array.from(new Set(list.map(getMonthKey))).sort().reverse();

// Técnicos em ordem alfabética
export const uniqueTechnicians = (list) =>
    Array.from(new Set(list.map((p) => p.technician_name))).sort((a, b) => a.localeCompare(b, 'pt-BR'));

/* ===================== Formulário ===================== */

export function emptyForm() {
    return {
        production_type: TYPE_PRINT,
        description: '',
        technician_name: '',
        client_name: '',
        equipment_name: '',
        production_date: todayISO(),
        supply_grams: '',
        production_minutes: '',
    };
}

// Máquina, insumo (min 0) e tempo (min 1) já são validados pelos atributos dos campos
// e pelas constraints da tabela; aqui ficam só os textos que o HTML não pega (espaços em branco)
export function validateProduction(v) {
    if (v.description.trim().length < 3) return 'Descreva o que foi impresso ou escaneado (mínimo 3 caracteres).';
    if (v.technician_name.trim().length < 2) return 'Informe o técnico responsável.';
    if (v.client_name.trim().length < 2) return 'Informe o cliente atendido.';
    return null;
}

// Só as colunas da tabela (o modal também carrega id e created_at)
export function toPayload(v) {
    return {
        production_type: v.production_type,
        description: v.description.trim(),
        technician_name: v.technician_name.trim(),
        client_name: v.client_name.trim(),
        equipment_name: v.equipment_name,
        production_date: v.production_date,
        supply_grams: Number(v.supply_grams),
        production_minutes: Number(v.production_minutes),
    };
}
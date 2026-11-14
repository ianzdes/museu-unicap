import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../../supabaseClient';
import styles from './ProductionReport.module.css';

const NO_DATE_KEY = 'sem-data';
const TYPE_PRINT = 'Impressão 3D';
const TYPE_SCAN = 'Digitalização';

const TYPE_BADGE_CLASS = {
    [TYPE_PRINT]: styles.badgeInfo,
    [TYPE_SCAN]: styles.badgeWarning,
};

const MONTH_ABBR = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

// Data de hoje no fuso local, em "YYYY-MM-DD"
function todayISO() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// "2026-11-05" -> "05/11/2026" (sem passar por Date, evita deslocamento de fuso)
function formatDate(value) {
    if (!value) return '-';
    const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
    return match ? `${match[3]}/${match[2]}/${match[1]}` : '-';
}

// Mês da produção: usa production_date; se faltar, created_at
function getMonthKey(item) {
    const raw = (item.production_date || item.created_at || '').slice(0, 7);
    return /^\d{4}-\d{2}$/.test(raw) ? raw : NO_DATE_KEY;
}

// "2026-11" -> "Novembro de 2026"
function formatMonth(key) {
    if (key === NO_DATE_KEY) return 'Sem data';
    const [year, month] = key.split('-').map(Number);
    const label = new Date(year, month - 1, 1).toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
    });
    return label.charAt(0).toUpperCase() + label.slice(1);
}

// "2026-11" -> "nov/2026"
function formatMonthShort(key) {
    if (key === NO_DATE_KEY) return 'Sem data';
    const [year, month] = key.split('-').map(Number);
    return `${MONTH_ABBR[month - 1]}/${year}`;
}

// 150 -> "2h 30min"
function formatDuration(minutes) {
    const total = Math.round(Number(minutes));
    if (!total || total <= 0) return '—';
    const h = Math.floor(total / 60);
    const m = total % 60;
    if (h === 0) return `${m} min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${String(m).padStart(2, '0')}min`;
}

// 1250 -> "1.250 g"
function formatSupply(grams) {
    return `${Number(grams || 0).toLocaleString('pt-BR')} g`;
}

function emptyForm() {
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

function validateProduction(v) {
    if (v.description.trim().length < 3) return 'Descreva o que foi impresso ou escaneado (mínimo 3 caracteres).';
    if (v.technician_name.trim().length < 2) return 'Informe o técnico responsável.';
    if (v.client_name.trim().length < 2) return 'Informe o cliente atendido.';
    if (!v.equipment_name) return 'Selecione a máquina utilizada.';

    const supply = Number(v.supply_grams === '' ? 0 : v.supply_grams);
    if (Number.isNaN(supply) || supply < 0) return 'A quantidade de insumo não pode ser negativa.';

    const minutes = Number(v.production_minutes);
    if (!minutes || minutes <= 0) return 'Informe o tempo de produção em minutos (maior que zero).';

    return null;
}

function toPayload(v) {
    return {
        production_type: v.production_type,
        description: v.description.trim(),
        technician_name: v.technician_name.trim(),
        client_name: v.client_name.trim(),
        equipment_name: v.equipment_name,
        production_date: v.production_date || todayISO(),
        supply_grams: Number(v.supply_grams === '' ? 0 : v.supply_grams),
        production_minutes: Math.round(Number(v.production_minutes)),
    };
}

/* ===================== Campos compartilhados (form + modal) ===================== */

function ProductionFields({ values, onChange, machines, technicianOptions }) {
    const set = (field, value) => onChange({ ...values, [field]: value });

    // Ao trocar o tipo, limpa a máquina; scanner normalmente não consome insumo
    const handleTypeChange = (value) => {
        onChange({
            ...values,
            production_type: value,
            equipment_name: '',
            supply_grams: value === TYPE_SCAN ? '0' : values.supply_grams,
        });
    };

    // Mostra as máquinas da categoria do tipo; se não houver nenhuma, mostra todas
    const machinesOfType = machines.filter((m) => m.category === values.production_type);
    const machineOptions = machinesOfType.length > 0 ? machinesOfType : machines;
    const hasCurrentMachine = machineOptions.some((m) => m.name === values.equipment_name);
    const isScan = values.production_type === TYPE_SCAN;

    return (
        <>
            <div className={styles.fieldGroup}>
                <label className={styles.label}>Tipo de Produção:</label>
                <select
                    value={values.production_type}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    className={styles.input}
                >
                    <option value={TYPE_PRINT}>Impressão 3D</option>
                    <option value={TYPE_SCAN}>Digitalização (Scanner)</option>
                </select>
            </div>

            <div className={styles.fieldGroup}>
                <label className={styles.label}>Descrição (o que foi impresso ou escaneado):</label>
                <textarea
                    value={values.description}
                    onChange={(e) => set('description', e.target.value)}
                    required
                    className={styles.textarea}
                    placeholder="Ex: Réplica de busto em PLA, escala 1:2"
                />
            </div>

            <div className={styles.fieldGroup}>
                <label className={styles.label}>Técnico Responsável:</label>
                <input
                    type="text"
                    list="technician-options"
                    value={values.technician_name}
                    onChange={(e) => set('technician_name', e.target.value)}
                    required
                    className={styles.input}
                    placeholder="Ex: Maria Souza"
                />
                <datalist id="technician-options">
                    {technicianOptions.map((tech) => (
                        <option key={tech} value={tech} />
                    ))}
                </datalist>
            </div>

            <div className={styles.fieldGroup}>
                <label className={styles.label}>Cliente Atendido:</label>
                <input
                    type="text"
                    value={values.client_name}
                    onChange={(e) => set('client_name', e.target.value)}
                    required
                    className={styles.input}
                    placeholder="Ex: João Silva (Aluno)"
                />
            </div>

            <div className={styles.fieldGroup}>
                <label className={styles.label}>Máquina Utilizada:</label>
                <select
                    value={values.equipment_name}
                    onChange={(e) => set('equipment_name', e.target.value)}
                    required
                    className={styles.input}
                >
                    <option value="">Selecione a máquina</option>
                    {values.equipment_name && !hasCurrentMachine && (
                        <option value={values.equipment_name}>{values.equipment_name}</option>
                    )}
                    {machineOptions.map((m) => (
                        <option key={m.id || m.name} value={m.name}>{m.name}</option>
                    ))}
                </select>
            </div>

            <div className={styles.fieldGroup}>
                <label className={styles.label}>Data da Produção:</label>
                <input
                    type="date"
                    value={values.production_date}
                    onChange={(e) => set('production_date', e.target.value)}
                    required
                    className={styles.input}
                />
            </div>

            <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                    <label className={styles.label}>Insumo Usado (g):</label>
                    <input
                        type="number"
                        min="0"
                        step="1"
                        value={values.supply_grams}
                        onChange={(e) => set('supply_grams', e.target.value)}
                        className={styles.input}
                        placeholder="0"
                    />
                </div>

                <div className={styles.fieldGroup}>
                    <label className={styles.label}>Tempo (minutos):</label>
                    <input
                        type="number"
                        min="1"
                        step="1"
                        value={values.production_minutes}
                        onChange={(e) => set('production_minutes', e.target.value)}
                        required
                        className={styles.input}
                        placeholder="Ex: 150"
                    />
                </div>
            </div>

            <p className={styles.hint}>
                {isScan
                    ? 'Digitalizações normalmente não consomem insumo: deixe 0.'
                    : 'Informe 0 se a produção não consumiu insumo.'}
            </p>
        </>
    );
}

/* ===================== Componente principal ===================== */

export function ProductionReport() {
    const [activeTab, setActiveTab] = useState('productions');
    const [view, setView] = useState('list');

    const [productions, setProductions] = useState([]);
    const [machines, setMachines] = useState([]);
    const [loading, setLoading] = useState(true);

    // filtros do relatório de produção
    const [searchTerm, setSearchTerm] = useState('');
    const [monthFilter, setMonthFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [technicianFilter, setTechnicianFilter] = useState('all');

    // mês escolhido no relatório por técnico ('' = mês mais recente com dados)
    const [techMonth, setTechMonth] = useState('');

    // formulário de nova produção
    const [formData, setFormData] = useState(emptyForm);
    const [submitting, setSubmitting] = useState(false);

    // modal de gestão
    const [selectedProduction, setSelectedProduction] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState(emptyForm);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchProductions();
        fetchMachines();
    }, []);

    const fetchProductions = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('productions')
            .select('*')
            .order('production_date', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao buscar produções:', error.message);
        } else {
            setProductions(data || []);
        }
        setLoading(false);
    };

    const fetchMachines = async () => {
        const { data, error } = await supabase
            .from('equipments')
            .select('id, name, category')
            .order('name', { ascending: true });

        if (error) {
            console.error('Erro ao buscar máquinas:', error.message);
        } else {
            setMachines(data || []);
        }
    };

    /* ---------- Cadastro ---------- */

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationError = validateProduction(formData);
        if (validationError) {
            alert(validationError);
            return;
        }

        setSubmitting(true);
        const { error } = await supabase.from('productions').insert([toPayload(formData)]);
        setSubmitting(false);

        if (error) {
            alert(`Erro ao registrar produção: ${error.message}`);
        } else {
            alert('Produção registrada com sucesso!');
            setFormData(emptyForm());
            setView('list');
            fetchProductions();
        }
    };

    /* ---------- Modal ---------- */

    const handleOpenModal = (item) => {
        setSelectedProduction(item);
        setEditData({
            production_type: item.production_type || TYPE_PRINT,
            description: item.description || '',
            technician_name: item.technician_name || '',
            client_name: item.client_name || '',
            equipment_name: item.equipment_name || '',
            production_date: item.production_date || todayISO(),
            supply_grams: String(item.supply_grams ?? 0),
            production_minutes: String(item.production_minutes ?? ''),
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProduction(null);
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        if (!selectedProduction) return;

        const validationError = validateProduction(editData);
        if (validationError) {
            alert(validationError);
            return;
        }

        setActionLoading(true);
        const { error } = await supabase
            .from('productions')
            .update(toPayload(editData))
            .eq('id', selectedProduction.id);
        setActionLoading(false);

        if (error) {
            alert(`Erro ao atualizar produção: ${error.message}`);
        } else {
            alert('Produção atualizada com sucesso!');
            handleCloseModal();
            fetchProductions();
        }
    };

    const handleDeleteProduction = async () => {
        if (!selectedProduction) return;
        if (!window.confirm('Tem certeza que deseja excluir este registro de produção?')) return;

        setActionLoading(true);
        const { error } = await supabase
            .from('productions')
            .delete()
            .eq('id', selectedProduction.id);
        setActionLoading(false);

        if (error) {
            alert(`Erro ao excluir produção: ${error.message}`);
        } else {
            alert('Produção excluída com sucesso!');
            handleCloseModal();
            fetchProductions();
        }
    };

    /* ---------- Dados derivados ---------- */

    // meses com dados (mais recente primeiro, "sem data" por último)
    const monthKeys = useMemo(() => {
        const keys = Array.from(new Set(productions.map(getMonthKey)));
        return keys.sort((a, b) => {
            if (a === NO_DATE_KEY) return 1;
            if (b === NO_DATE_KEY) return -1;
            return b.localeCompare(a);
        });
    }, [productions]);

    const technicianNames = useMemo(() => {
        const names = productions.map((p) => p.technician_name).filter(Boolean);
        return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b, 'pt-BR'));
    }, [productions]);

    // --- Relatório 8: produção ---
    const filteredProductions = productions.filter((item) => {
        const term = searchTerm.trim().toLowerCase();
        const matchesSearch = !term || [
            item.description,
            item.client_name,
            item.equipment_name,
            item.technician_name,
        ].some((field) => field?.toLowerCase().includes(term));

        const matchesMonth = monthFilter === 'all' || getMonthKey(item) === monthFilter;
        const matchesType = typeFilter === 'all' || item.production_type === typeFilter;
        const matchesTechnician = technicianFilter === 'all' || item.technician_name === technicianFilter;

        return matchesSearch && matchesMonth && matchesType && matchesTechnician;
    });

    const filteredTotals = useMemo(() => {
        const count = filteredProductions.length;
        const minutes = filteredProductions.reduce((sum, p) => sum + (Number(p.production_minutes) || 0), 0);
        const supply = filteredProductions.reduce((sum, p) => sum + (Number(p.supply_grams) || 0), 0);
        return { count, supply, averageMinutes: count > 0 ? minutes / count : 0 };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productions, searchTerm, monthFilter, typeFilter, technicianFilter]);

    // --- Relatório 9: mensal por técnico ---
    const effectiveTechMonth = techMonth || monthKeys[0] || '';

    const technicianMonthly = useMemo(() => {
        const map = new Map();

        productions
            .filter((p) => getMonthKey(p) === effectiveTechMonth)
            .forEach((p) => {
                const name = p.technician_name || 'Não informado';
                if (!map.has(name)) {
                    map.set(name, { name, total: 0, prints: 0, scans: 0, supply: 0, minutes: 0 });
                }
                const entry = map.get(name);
                entry.total += 1;
                if (p.production_type === TYPE_PRINT) entry.prints += 1;
                if (p.production_type === TYPE_SCAN) entry.scans += 1;
                entry.supply += Number(p.supply_grams) || 0;
                entry.minutes += Number(p.production_minutes) || 0;
            });

        return Array.from(map.values()).sort((a, b) => b.total - a.total);
    }, [productions, effectiveTechMonth]);

    const monthlyTotals = technicianMonthly.reduce(
        (acc, t) => ({
            total: acc.total + t.total,
            prints: acc.prints + t.prints,
            scans: acc.scans + t.scans,
            supply: acc.supply + t.supply,
            minutes: acc.minutes + t.minutes,
        }),
        { total: 0, prints: 0, scans: 0, supply: 0, minutes: 0 }
    );

    const maxTechTotal = Math.max(1, ...technicianMonthly.map((t) => t.total));

    // Matriz técnico x mês (últimos 6 meses com dados, em ordem cronológica)
    const pivot = useMemo(() => {
        const months = monthKeys.filter((k) => k !== NO_DATE_KEY).slice(0, 6).reverse();
        const counts = new Map();

        productions.forEach((p) => {
            const month = getMonthKey(p);
            if (!months.includes(month)) return;
            const name = p.technician_name || 'Não informado';
            const key = `${name}|${month}`;
            counts.set(key, (counts.get(key) || 0) + 1);
        });

        const names = Array.from(
            new Set(productions.map((p) => p.technician_name || 'Não informado'))
        ).sort((a, b) => a.localeCompare(b, 'pt-BR'));

        const rows = names
            .map((name) => {
                const cells = months.map((month) => counts.get(`${name}|${month}`) || 0);
                return { name, cells, total: cells.reduce((s, n) => s + n, 0) };
            })
            .filter((row) => row.total > 0);

        return { months, rows };
    }, [productions, monthKeys]);

    /* ===================== Formulário de nova produção ===================== */

    if (view === 'form') {
        return (
            <div className={styles.card}>
                <div className={styles.formHeader}>
                    <h2>Nova Produção</h2>
                    <button onClick={() => setView('list')} className={styles.backButton}>
                        ← Voltar para o relatório
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <ProductionFields
                        values={formData}
                        onChange={setFormData}
                        machines={machines}
                        technicianOptions={technicianNames}
                    />

                    <button type="submit" disabled={submitting} className={styles.submitButton}>
                        {submitting ? 'Salvando...' : 'Registrar Produção'}
                    </button>
                </form>
            </div>
        );
    }

    /* ===================== Relatórios ===================== */

    return (
        <div className={styles.container}>

            {/* Cabeçalho */}
            <div className={styles.headerRow}>
                <div>
                    <span className={styles.miniCategory}>RELATÓRIOS</span>
                    <h2 className={styles.title}>Relatório de Produção</h2>
                    <p className={styles.subtitle}>
                        Acompanhe o que foi impresso ou escaneado, por quem, para quem e com qual máquina.
                    </p>
                </div>
                <button onClick={() => setView('form')} className={styles.newButton}>
                    + Nova produção
                </button>
            </div>

            {/* Abas */}
            <div className={styles.tabs} role="tablist">
                <button
                    role="tab"
                    aria-selected={activeTab === 'productions'}
                    className={`${styles.tab} ${activeTab === 'productions' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('productions')}
                >
                    Produções
                </button>
                <button
                    role="tab"
                    aria-selected={activeTab === 'technicians'}
                    className={`${styles.tab} ${activeTab === 'technicians' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('technicians')}
                >
                    Mensal por técnico
                </button>
            </div>

            {loading ? (

                <div className={styles.loadingContainer}>
                    <p className={styles.loadingText}>Carregando produções...</p>
                </div>

            ) : productions.length === 0 ? (

                <div className={styles.emptyCard}>
                    <p className={styles.emptyTitle}>Nenhuma produção registrada no momento.</p>
                    <p className={styles.emptySubtitle}>
                        Clique em &quot;Nova produção&quot; para registrar a primeira impressão ou digitalização.
                    </p>
                </div>

            ) : activeTab === 'productions' ? (
                <>
                    {/* Métricas (acompanham os filtros) */}
                    <div className={styles.metricGrid}>
                        <div className={styles.metricCard}>
                            <span className={styles.metricLabel}>Produções</span>
                            <span className={styles.metricValue}>{filteredTotals.count}</span>
                        </div>

                        <div className={styles.metricCard}>
                            <span className={styles.metricLabel}>Tempo Médio</span>
                            <span className={styles.metricValue}>
                                {formatDuration(filteredTotals.averageMinutes)}
                            </span>
                        </div>

                        <div className={styles.metricCard}>
                            <span className={styles.metricLabel}>Insumo Consumido</span>
                            <span className={styles.metricValue}>{formatSupply(filteredTotals.supply)}</span>
                        </div>
                    </div>

                    {/* Tabela de produções */}
                    <div className={styles.tableCard}>
                        <div className={styles.filterBar}>
                            <input
                                type="text"
                                placeholder="Pesquisar por descrição, cliente, técnico ou máquina..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={styles.searchInput}
                            />
                            <select
                                value={monthFilter}
                                onChange={(e) => setMonthFilter(e.target.value)}
                                className={styles.selectFilter}
                            >
                                <option value="all">Mês: todos</option>
                                {monthKeys.map((key) => (
                                    <option key={key} value={key}>{formatMonth(key)}</option>
                                ))}
                            </select>
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className={styles.selectFilter}
                            >
                                <option value="all">Tipo: todos</option>
                                <option value={TYPE_PRINT}>Impressão 3D</option>
                                <option value={TYPE_SCAN}>Digitalização</option>
                            </select>
                            <select
                                value={technicianFilter}
                                onChange={(e) => setTechnicianFilter(e.target.value)}
                                className={styles.selectFilter}
                            >
                                <option value="all">Técnico: todos</option>
                                {technicianNames.map((tech) => (
                                    <option key={tech} value={tech}>{tech}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr className={styles.thRow}>
                                        <th className={styles.th}>DATA</th>
                                        <th className={styles.th}>DESCRIÇÃO</th>
                                        <th className={styles.th}>TIPO</th>
                                        <th className={styles.th}>TÉCNICO</th>
                                        <th className={styles.th}>CLIENTE</th>
                                        <th className={styles.th}>MÁQUINA</th>
                                        <th className={styles.th}>INSUMO</th>
                                        <th className={styles.th}>TEMPO</th>
                                        <th className={styles.th}>AÇÕES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProductions.length === 0 ? (
                                        <tr>
                                            <td colSpan="9" className={styles.emptyCell}>
                                                Nenhuma produção encontrada para os filtros selecionados.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredProductions.map((item) => (
                                            <tr key={item.id} className={styles.tr}>
                                                <td className={`${styles.td} ${styles.tdNowrap}`}>
                                                    {formatDate(item.production_date)}
                                                </td>
                                                <td className={`${styles.td} ${styles.tdDescription}`}>
                                                    {item.description}
                                                </td>
                                                <td className={styles.td}>
                                                    <span className={`${styles.badge} ${TYPE_BADGE_CLASS[item.production_type] || styles.badgeInfo}`}>
                                                        {item.production_type}
                                                    </span>
                                                </td>
                                                <td className={styles.td}>{item.technician_name}</td>
                                                <td className={styles.td}>{item.client_name}</td>
                                                <td className={styles.td}>{item.equipment_name}</td>
                                                <td className={`${styles.td} ${styles.tdNowrap}`}>
                                                    {formatSupply(item.supply_grams)}
                                                </td>
                                                <td className={`${styles.td} ${styles.tdNowrap}`}>
                                                    {formatDuration(item.production_minutes)}
                                                </td>
                                                <td className={styles.td}>
                                                    <button
                                                        onClick={() => handleOpenModal(item)}
                                                        className={styles.actionBtn}
                                                    >
                                                        Gerenciar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    {/* Detalhe do mês escolhido */}
                    <div className={styles.tableCard}>
                        <div className={styles.sectionHeader}>
                            <div>
                                <h3 className={styles.sectionTitle}>
                                    Produção de {formatMonth(effectiveTechMonth)}
                                </h3>
                                <p className={styles.sectionHint}>
                                    Desempenho de cada técnico no mês selecionado.
                                </p>
                            </div>

                            <select
                                value={effectiveTechMonth}
                                onChange={(e) => setTechMonth(e.target.value)}
                                className={styles.selectFilter}
                            >
                                {monthKeys.map((key) => (
                                    <option key={key} value={key}>{formatMonth(key)}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr className={styles.thRow}>
                                        <th className={styles.th}>TÉCNICO</th>
                                        <th className={styles.th}>PRODUÇÕES</th>
                                        <th className={styles.th}>IMPRESSÕES</th>
                                        <th className={styles.th}>DIGITALIZAÇÕES</th>
                                        <th className={styles.th}>INSUMO</th>
                                        <th className={styles.th}>TEMPO TOTAL</th>
                                        <th className={styles.th}>TEMPO MÉDIO</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {technicianMonthly.map((tech) => (
                                        <tr key={tech.name} className={styles.tr}>
                                            <td className={`${styles.td} ${styles.tdStrong}`}>{tech.name}</td>
                                            <td className={styles.td}>
                                                <div className={styles.totalCell}>
                                                    <span className={styles.totalNumber}>{tech.total}</span>
                                                    <div className={styles.barTrack}>
                                                        <div
                                                            className={styles.barFill}
                                                            style={{ width: `${(tech.total / maxTechTotal) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={`${styles.td} ${tech.prints === 0 ? styles.tdMuted : ''}`}>
                                                {tech.prints}
                                            </td>
                                            <td className={`${styles.td} ${tech.scans === 0 ? styles.tdMuted : ''}`}>
                                                {tech.scans}
                                            </td>
                                            <td className={`${styles.td} ${styles.tdNowrap}`}>{formatSupply(tech.supply)}</td>
                                            <td className={`${styles.td} ${styles.tdNowrap}`}>{formatDuration(tech.minutes)}</td>
                                            <td className={`${styles.td} ${styles.tdNowrap}`}>
                                                {formatDuration(tech.minutes / tech.total)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className={styles.totalRow}>
                                        <td className={styles.td}>TOTAL DO MÊS</td>
                                        <td className={styles.td}>{monthlyTotals.total}</td>
                                        <td className={styles.td}>{monthlyTotals.prints}</td>
                                        <td className={styles.td}>{monthlyTotals.scans}</td>
                                        <td className={`${styles.td} ${styles.tdNowrap}`}>{formatSupply(monthlyTotals.supply)}</td>
                                        <td className={`${styles.td} ${styles.tdNowrap}`}>{formatDuration(monthlyTotals.minutes)}</td>
                                        <td className={`${styles.td} ${styles.tdNowrap}`}>
                                            {formatDuration(monthlyTotals.total > 0 ? monthlyTotals.minutes / monthlyTotals.total : 0)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Evolução: técnico x mês */}
                    <div className={styles.tableCard}>
                        <div className={styles.sectionHeader}>
                            <div>
                                <h3 className={styles.sectionTitle}>Evolução mensal por técnico</h3>
                                <p className={styles.sectionHint}>
                                    Quantidade de produções nos últimos meses com registros.
                                </p>
                            </div>
                        </div>

                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr className={styles.thRow}>
                                        <th className={styles.th}>TÉCNICO</th>
                                        {pivot.months.map((month) => (
                                            <th key={month} className={styles.th}>
                                                {formatMonthShort(month).toUpperCase()}
                                            </th>
                                        ))}
                                        <th className={styles.th}>TOTAL</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pivot.rows.map((row) => (
                                        <tr key={row.name} className={styles.tr}>
                                            <td className={`${styles.td} ${styles.tdStrong}`}>{row.name}</td>
                                            {row.cells.map((count, index) => (
                                                <td
                                                    key={pivot.months[index]}
                                                    className={`${styles.td} ${count === 0 ? styles.tdMuted : ''}`}
                                                >
                                                    {count === 0 ? '—' : count}
                                                </td>
                                            ))}
                                            <td className={`${styles.td} ${styles.tdStrong}`}>{row.total}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* caixa de diálogo / modal */}
            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalCard}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>Gerenciar Produção</h3>
                            <button onClick={handleCloseModal} className={styles.closeBtn}>✕</button>
                        </div>

                        <form onSubmit={handleSaveEdit} className={styles.modalForm}>
                            <ProductionFields
                                values={editData}
                                onChange={setEditData}
                                machines={machines}
                                technicianOptions={technicianNames}
                            />

                            <div className={styles.modalFooter}>
                                <button
                                    type="button"
                                    onClick={handleDeleteProduction}
                                    disabled={actionLoading}
                                    className={styles.deleteBtn}
                                >
                                    Deletar
                                </button>
                                <div className={styles.modalFooterActions}>
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className={styles.cancelBtn}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={actionLoading}
                                        className={styles.submitButton}
                                    >
                                        {actionLoading ? 'Salvando...' : 'Salvar Alterações'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
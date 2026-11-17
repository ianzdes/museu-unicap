// busca de dados, cadastro/edicao/exclusao, abas e modal
import { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import { ProductionFields } from './ProductionFields';
import { ProductionsTab } from './ProductionsTab';
import { TechnicianTab } from './TechnicianTab';
import { emptyForm, toPayload, uniqueTechnicians, validateProduction } from './ProductionUtils';
import styles from './ProductionReport.module.css';

const TABS = [
    { id: 'productions', label: 'Produções' },
    { id: 'technicians', label: 'Mensal por técnico' },
];

// Este arquivo cuida de: buscar os dados, cadastrar/editar/excluir e alternar as telas.
// A parte visual de cada aba está em ProductionsTab.jsx e TechnicianTab.jsx.
export function ProductionReport() {
    const [activeTab, setActiveTab] = useState('productions');
    const [view, setView] = useState('list'); // 'list' = relatórios | 'form' = nova produção

    const [productions, setProductions] = useState([]);
    const [machines, setMachines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState(emptyForm);
    const [editData, setEditData] = useState(null); // produção aberta no modal (null = modal fechado)

    useEffect(() => {
        fetchProductions();
        fetchMachines();
    }, []);

    const fetchProductions = async () => {
        const { data, error } = await supabase
            .from('productions')
            .select('*')
            .order('production_date', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao buscar produções:', error.message);
        } else {
            setProductions(data);
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
            setMachines(data);
        }
    };

    // Executa uma operação no Supabase: controla o botão, mostra o alerta e recarrega a lista
    const runRequest = async (request, successMessage, errorMessage, afterSuccess) => {
        setSaving(true);
        const { error } = await request;
        setSaving(false);

        if (error) {
            alert(`${errorMessage}: ${error.message}`);
            return;
        }

        alert(successMessage);
        afterSuccess();
        fetchProductions();
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const validationError = validateProduction(formData);
        if (validationError) {
            alert(validationError);
            return;
        }

        runRequest(
            supabase.from('productions').insert([toPayload(formData)]),
            'Produção registrada com sucesso!',
            'Erro ao registrar produção',
            () => {
                setFormData(emptyForm());
                setView('list');
            }
        );
    };

    const handleSaveEdit = (e) => {
        e.preventDefault();

        const validationError = validateProduction(editData);
        if (validationError) {
            alert(validationError);
            return;
        }

        runRequest(
            supabase.from('productions').update(toPayload(editData)).eq('id', editData.id),
            'Produção atualizada com sucesso!',
            'Erro ao atualizar produção',
            () => setEditData(null)
        );
    };

    const handleDelete = () => {
        if (!window.confirm('Tem certeza que deseja excluir este registro de produção?')) return;

        runRequest(
            supabase.from('productions').delete().eq('id', editData.id),
            'Produção excluída com sucesso!',
            'Erro ao excluir produção',
            () => setEditData(null)
        );
    };

    const technicianNames = uniqueTechnicians(productions);

    /* ===================== Tela: nova produção ===================== */

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

                    <button type="submit" disabled={saving} className={styles.submitButton}>
                        {saving ? 'Salvando...' : 'Registrar Produção'}
                    </button>
                </form>
            </div>
        );
    }

    /* ===================== Tela: relatórios ===================== */

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
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        role="tab"
                        aria-selected={activeTab === tab.id}
                        className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Conteúdo da aba */}
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
                <ProductionsTab productions={productions} onManage={setEditData} />
            ) : (
                <TechnicianTab productions={productions} />
            )}

            {/* Modal de edição */}
            {editData && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalCard}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>Gerenciar Produção</h3>
                            <button onClick={() => setEditData(null)} className={styles.closeBtn}>✕</button>
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
                                    onClick={handleDelete}
                                    disabled={saving}
                                    className={styles.deleteBtn}
                                >
                                    Deletar
                                </button>
                                <div className={styles.modalFooterActions}>
                                    <button
                                        type="button"
                                        onClick={() => setEditData(null)}
                                        className={styles.cancelBtn}
                                    >
                                        Cancelar
                                    </button>
                                    <button type="submit" disabled={saving} className={styles.submitButton}>
                                        {saving ? 'Salvando...' : 'Salvar Alterações'}
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
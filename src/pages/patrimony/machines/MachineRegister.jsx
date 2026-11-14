import { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import styles from './MachineRegister.module.css';

const STATUS_BADGE_CLASS = {
    'Disponível': styles.badgeActive,
    'Emprestado': styles.badgeInfo,
    'Manutenção': styles.badgeWarning,
};

export function MachineRegister() {
    const [view, setView] = useState('list');

    const [equipments, setEquipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [conditionFilter, setConditionFilter] = useState('all');

    const [assetCode, setAssetCode] = useState('');
    const [name, setName] = useState('');
    const [category, setCategory] = useState('Eletrônico');
    const [condition, setCondition] = useState('Boa');
    const [status, setStatus] = useState('Disponível');
    const [lastMaintenance, setLastMaintenance] = useState('');
    const [supplyLevel, setSupplyLevel] = useState(100);
    const [submitting, setSubmitting] = useState(false);

    // estados para controlar o modal de detalhes
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editName, setEditName] = useState('');
    const [editCategory, setEditCategory] = useState('');
    const [editCondition, setEditCondition] = useState('');
    const [editStatus, setEditStatus] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchEquipments();
    }, []);

    const fetchEquipments = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('equipments')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao buscar equipamentos:', error.message);
        } else {
            setEquipments(data || []);
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (name.trim().length < 2) {
            alert("O nome do equipamento deve ter no mínimo 2 caracteres.");
            return;
        }

        if (supplyLevel < 0 || supplyLevel > 100) {
            alert("O valor tem que estar entre 0 e 100");
            return;
        }

        setSubmitting(true);

        const { error } = await supabase
            .from('equipments')
            .insert([
                {
                    asset_code: assetCode || `PAT-${Math.floor(100 + Math.random() * 900)}`,
                    name,
                    category,
                    condition,
                    status,
                    last_maintenance: lastMaintenance || null,
                    supply_level: supplyLevel || 'N/A'
                }
            ]);

        setSubmitting(false);

        if (error) {
            alert(`Erro ao registrar equipamento: ${error.message}`);
        } else {
            alert(`Equipamento "${name}" cadastrado com sucesso!`);
            setAssetCode('');
            setName('');
            setCategory('Eletrônico');
            setCondition('Boa');
            setStatus('Disponível');
            setLastMaintenance('');
            setSupplyLevel(100);
            setView('list');
            fetchEquipments();
        }
    };

    // funções do modal
    const handleOpenModal = (item) => {
        setSelectedEquipment(item);
        setEditName(item.name || '');
        setEditCategory(item.category || 'Eletrônico');
        setEditCondition(item.condition || 'Boa');
        setEditStatus(item.status || 'Disponível');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedEquipment(null);
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        if (!selectedEquipment) return;

        setActionLoading(true);
        const { error } = await supabase
            .from('equipments')
            .update({
                name: editName,
                category: editCategory,
                condition: editCondition,
                status: editStatus
            })
            .eq('id', selectedEquipment.id);

        setActionLoading(false);

        if (error) {
            alert(`Erro ao atualizar equipamento: ${error.message}`);
        } else {
            alert('Equipamento atualizado com sucesso!');
            handleCloseModal();
            fetchEquipments();
        }
    };

    const handleDeleteEquipment = async () => {
        if (!selectedEquipment) return;
        if (!window.confirm(`Tem certeza que deseja excluir o equipamento ${selectedEquipment.name}?`)) return;

        setActionLoading(true);
        const { error } = await supabase
            .from('equipments')
            .delete()
            .eq('id', selectedEquipment.id);

        setActionLoading(false);

        if (error) {
            alert(`Erro ao excluir equipamento: ${error.message}`);
        } else {
            alert('Equipamento excluído com sucesso!');
            handleCloseModal();
            fetchEquipments();
        }
    };

    const filteredEquipments = equipments.filter((eq) => {
        const matchesSearch = eq.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              eq.asset_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              eq.category?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || eq.category === categoryFilter;
        const matchesStatus = statusFilter === 'all' || eq.status === statusFilter;
        const matchesCondition = conditionFilter === 'all' || eq.condition === conditionFilter;

        return matchesSearch && matchesCategory && matchesStatus && matchesCondition;
    });

    if (view === 'form') {
        return (
            <div className={styles.card}>
                <div className={styles.formHeader}>
                    <h2>Novo Equipamento</h2>
                    <button onClick={() => setView('list')} className={styles.backButton}>
                        ← Voltar para a lista
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Código de Patrimônio:</label>
                        <input
                            type="text"
                            value={assetCode}
                            onChange={(e) => setAssetCode(e.target.value)}
                            className={styles.input}
                            placeholder="Ex: PAT-105"
                        />
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Nome do Equipamento:</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className={styles.input}
                            placeholder="Ex: Impressora 3D Ender 3"
                        />
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Categoria:</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className={styles.input}
                        >
                            <option value="Eletrônico">Eletrônico</option>
                            <option value="Digitalização">Scanner</option>
                            <option value="Audiovisual">Audiovisual</option>
                            <option value="Impressão 3D">Impressora 3D</option>
                        </select>
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Condição:</label>
                        <select
                            value={condition}
                            onChange={(e) => setCondition(e.target.value)}
                            className={styles.input}
                        >
                            <option value="Excelente">Excelente</option>
                            <option value="Boa">Boa</option>
                            <option value="Regular">Regular</option>
                            <option value="Ruim">Ruim</option>
                        </select>
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Situação Inicial:</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className={styles.input}
                        >
                            <option value="Disponível">Disponível</option>
                            <option value="Emprestado">Emprestado</option>
                            <option value="Manutenção">Manutenção</option>
                        </select>
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Última Manutenção:</label>
                        <input
                            type="date"
                            value={lastMaintenance}
                            onChange={(e) => setLastMaintenance(e.target.value)}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Nível de Insumo / Filamento (em porcentagem):</label>
                        <input
                            type="text"
                            value={supplyLevel}
                            onChange={(e) => setSupplyLevel(e.target.value)}
                            placeholder="Ex: 80% ou 500g"
                            className={styles.input}
                        />
                    </div>

                    <button type="submit" disabled={submitting} className={styles.submitButton}>
                        {submitting ? 'Salvando...' : 'Salvar Equipamento'}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.headerRow}>
                <div>
                    <span className={styles.miniCategory}>PATRIMÔNIO</span>
                    <h2 className={styles.title}>Máquinas</h2>
                    <p className={styles.subtitle}>Consulte disponibilidade, condição e situação dos equipamentos.</p>
                </div>
                <button onClick={() => setView('form')} className={styles.newButton}>
                    + Novo equipamento
                </button>
            </div>

            <div className={styles.tableCard}>
                <div className={styles.filterBar}>
                    <input
                        type="text"
                        placeholder="Pesquisar por nome, código ou patrimônio..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className={styles.selectFilter}
                    >
                        <option value="all">Categoria: todos</option>
                        <option value="Eletrônico">Eletrônico</option>
                        <option value="Digitalização">Digitalização</option>
                        <option value="Audiovisual">Audiovisual</option>
                        <option value="Impressão 3D">Impressão 3D</option>
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className={styles.selectFilter}
                    >
                        <option value="all">Situação: todos</option>
                        <option value="Disponível">Disponível</option>
                        <option value="Emprestado">Emprestado</option>
                        <option value="Manutenção">Manutenção</option>
                    </select>
                    <select
                        value={conditionFilter}
                        onChange={(e) => setConditionFilter(e.target.value)}
                        className={styles.selectFilter}
                    >
                        <option value="all">Condição: todos</option>
                        <option value="Boa">Boa</option>
                        <option value="Regular">Regular</option>
                        <option value="Excelente">Excelente</option>
                    </select>
                </div>

                {loading ? (
                    <div className={styles.loadingBox}>Carregando equipamentos...</div>
                ) : (
                    <div className={styles.tableScroll}>
                        <table className={styles.table}>
                            <thead>
                                <tr className={styles.thRow}>
                                    <th className={styles.th}>PATRIMÔNIO</th>
                                    <th className={styles.th}>EQUIPAMENTO</th>
                                    <th className={styles.th}>CATEGORIA</th>
                                    <th className={styles.th}>CONDIÇÃO</th>
                                    <th className={styles.th}>SITUAÇÃO</th>
                                    <th className={styles.th}>ÚLTIMA MANUTENÇÃO</th>
                                    <th className={styles.th}>INSUMO</th>
                                    <th className={styles.th}>AÇÕES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEquipments.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className={styles.emptyCell}>
                                            Nenhum equipamento encontrado.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredEquipments.map((item, index) => {
                                        const badgeClass = STATUS_BADGE_CLASS[item.status] || styles.badgeActive;

                                        return (
                                            <tr key={item.id || index} className={styles.tr}>
                                                <td className={`${styles.td} ${styles.tdCode}`}>
                                                    {item.asset_code || `PAT-${101 + index}`}
                                                </td>
                                                <td className={`${styles.td} ${styles.tdName}`}>{item.name}</td>
                                                <td className={styles.td}>{item.category}</td>
                                                <td className={styles.td}>{item.condition || 'Boa'}</td>
                                                <td className={styles.td}>
                                                    <span className={`${styles.badge} ${badgeClass}`}>
                                                        ● {item.status || 'Disponível'}
                                                    </span>
                                                </td>
                                                <td className={styles.td}>
                                                    {item.last_maintenance ? new Date(item.last_maintenance).toLocaleDateString('pt-BR') : '—'}
                                                </td>
                                                <td className={styles.td}>{item.supply_level || '100%'}</td>
                                                <td className={styles.td}>
                                                    <button
                                                        onClick={() => handleOpenModal(item)}
                                                        className={styles.actionBtn}
                                                    >
                                                        Gerenciar
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* caixa de diálogo / modal */}
            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalCard}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>Gerenciar Equipamento</h3>
                            <button onClick={handleCloseModal} className={styles.closeBtn}>✕</button>
                        </div>

                        <form onSubmit={handleSaveEdit} className={styles.modalForm}>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Nome do Equipamento:</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    required
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Categoria:</label>
                                <select
                                    value={editCategory}
                                    onChange={(e) => setEditCategory(e.target.value)}
                                    className={styles.input}
                                >
                                    <option value="Eletrônico">Eletrônico</option>
                                    <option value="Digitalização">Scanner</option>
                                    <option value="Audiovisual">Audiovisual</option>
                                    <option value="Impressão 3D">Impressora 3D</option>
                                </select>
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Condição:</label>
                                <select
                                    value={editCondition}
                                    onChange={(e) => setEditCondition(e.target.value)}
                                    className={styles.input}
                                >
                                    <option value="Excelente">Excelente</option>
                                    <option value="Boa">Boa</option>
                                    <option value="Regular">Regular</option>
                                    <option value="Ruim">Ruim</option>
                                </select>
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Situação:</label>
                                <select
                                    value={editStatus}
                                    onChange={(e) => setEditStatus(e.target.value)}
                                    className={styles.input}
                                >
                                    <option value="Disponível">Disponível</option>
                                    <option value="Emprestado">Emprestado</option>
                                    <option value="Manutenção">Manutenção</option>
                                </select>
                            </div>

                            <div className={styles.modalFooter}>
                                <button
                                    type="button"
                                    onClick={handleDeleteEquipment}
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
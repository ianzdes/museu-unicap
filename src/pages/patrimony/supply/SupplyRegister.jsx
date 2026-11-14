import { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import styles from './SupplyRegister.module.css';

export function SupplyRegister() {
    const [view, setView] = useState('list');

    const [supplies, setSupplies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [materialFilter, setMaterialFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const [name, setName] = useState('');
    const [material, setMaterial] = useState('PLA');
    const [color, setColor] = useState('');
    const [purchaseKg, setPurchaseKg] = useState(1);
    const [currentStockGrams, setCurrentStockGrams] = useState(1000);
    const [status, setStatus] = useState('Em Estoque');
    const [submitting, setSubmitting] = useState(false);

    // estados para controlar o modal de detalhes / edição de suprimentos
    const [selectedSupply, setSelectedSupply] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editName, setEditName] = useState('');
    const [editMaterial, setEditMaterial] = useState('');
    const [editColor, setEditColor] = useState('');
    const [editCurrentStockGrams, setEditCurrentStockGrams] = useState('');
    const [editStatus, setEditStatus] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchSupplies();
    }, []);

    const fetchSupplies = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('supplies')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao buscar suprimentos:', error.message);
        } else {
            setSupplies(data || []);
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (name.trim().length < 2) {
            alert("O nome do insumo deve ter no mínimo 2 caracteres.");
            return;
        }

        if (purchaseKg || currentStockGrams < 0) {
            alert("A quantidade comprada ou o estoque atual não podem ser negativos.");
            return;
        }

        setSubmitting(true);

        const stockInGrams = Number(currentStockGrams) || (Number(purchaseKg) * 1000);

        const { error } = await supabase
            .from('supplies')
            .insert([
                {
                    name,
                    material,
                    color: color || 'Padrão',
                    purchase_kg: Number(purchaseKg),
                    current_stock_grams: stockInGrams,
                    status: stockInGrams <= 200 ? 'Baixo Estoque' : status
                }
            ]);

        setSubmitting(false);

        if (error) {
            alert(`Erro ao registrar insumo: ${error.message}`);
        } else {
            alert(`Insumo "${name}" cadastrado com sucesso!`);
            setName('');
            setMaterial('PLA');
            setColor('');
            setPurchaseKg(1);
            setCurrentStockGrams(1000);
            setStatus('Em Estoque');
            setView('list');
            fetchSupplies();
        }
    };

    // funções do modal de gestão do suprimento
    const handleOpenModal = (item) => {
        setSelectedSupply(item);
        setEditName(item.name || '');
        setEditMaterial(item.material || 'PLA');
        setEditColor(item.color || '');
        setEditCurrentStockGrams(item.current_stock_grams ?? '1000');
        setEditStatus(item.status || 'Em Estoque');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedSupply(null);
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        if (!selectedSupply) return;

        setActionLoading(true);
        const stockGramsNum = Number(editCurrentStockGrams) || 0;
        const calculatedStatus = stockGramsNum <= 0 ? 'Esgotado' : stockGramsNum <= 200 ? 'Baixo Estoque' : editStatus;

        const { error } = await supabase
            .from('supplies')
            .update({
                name: editName,
                material: editMaterial,
                color: editColor,
                current_stock_grams: stockGramsNum,
                status: calculatedStatus
            })
            .eq('id', selectedSupply.id);

        setActionLoading(false);

        if (error) {
            alert(`Erro ao atualizar insumo: ${error.message}`);
        } else {
            alert('Insumo atualizado com sucesso!');
            handleCloseModal();
            fetchSupplies();
        }
    };

    const handleDeleteSupply = async () => {
        if (!selectedSupply) return;
        if (!window.confirm(`Tem certeza que deseja excluir o insumo ${selectedSupply.name}?`)) return;

        setActionLoading(true);
        const { error } = await supabase
            .from('supplies')
            .delete()
            .eq('id', selectedSupply.id);

        setActionLoading(false);

        if (error) {
            alert(`Erro ao excluir insumo: ${error.message}`);
        } else {
            alert('Insumo excluído com sucesso!');
            handleCloseModal();
            fetchSupplies();
        }
    };

    const filteredSupplies = supplies.filter((item) => {
        const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              item.color?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              item.material?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesMaterial = materialFilter === 'all' || item.material === materialFilter;
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

        return matchesSearch && matchesMaterial && matchesStatus;
    });

    if (view === 'form') {
        return (
            <div className={styles.card}>
                <div className={styles.formHeader}>
                    <h2>Novo Suprimento / Insumo</h2>
                    <button onClick={() => setView('list')} className={styles.backButton}>
                        ← Voltar para a lista
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Nome do Suprimento / Filamento:</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className={styles.input}
                            placeholder="Ex: Filamento PLA Premium 1.75mm"
                        />
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Tipo de Material:</label>
                        <select
                            value={material}
                            onChange={(e) => setMaterial(e.target.value)}
                            className={styles.input}
                        >
                            <option value="PLA">PLA</option>
                            <option value="ABS">ABS</option>
                            <option value="PETG">PETG</option>
                            <option value="Resina">Resina (SLA)</option>
                            <option value="Outro">Outro</option>
                        </select>
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Cor / Acabamento:</label>
                        <input
                            type="text"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className={styles.input}
                            placeholder="Ex: Preto, Branco, Transparente"
                        />
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Quantidade Comprada (em Kg):</label>
                        <input
                            type="number"
                            step="0.1"
                            value={purchaseKg}
                            onChange={(e) => {
                                setPurchaseKg(e.target.value);
                                setCurrentStockGrams(String(Number(e.target.value) * 1000));
                            }}
                            required
                            className={styles.input}
                            placeholder="Ex: 1 (para rolo de 1kg)"
                        />
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Estoque Atual Fracionado (em Gramas/g):</label>
                        <input
                            type="number"
                            value={currentStockGrams}
                            onChange={(e) => setCurrentStockGrams(e.target.value)}
                            required
                            className={styles.input}
                            placeholder="Ex: 850 (restante do rolo)"
                        />
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Situação do Estoque:</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className={styles.input}
                        >
                            <option value="Em Estoque">Em Estoque</option>
                            <option value="Baixo Estoque">Baixo Estoque</option>
                            <option value="Esgotado">Esgotado</option>
                        </select>
                    </div>

                    <button type="submit" disabled={submitting} className={styles.submitButton}>
                        {submitting ? 'Salvando...' : 'Salvar Insumo'}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.headerRow}>
                <div>
                    <span className={styles.miniCategory}>ESTOQUE & INSUMOS</span>
                    <h2 className={styles.title}>Suprimentos de Impressão</h2>
                    <p className={styles.subtitle}>Gerencie rolos de filamento, resinas e controle de consumo fracionado.</p>
                </div>
                <button onClick={() => setView('form')} className={styles.newButton}>
                    + Novo insumo
                </button>
            </div>

            <div className={styles.tableCard}>
                <div className={styles.filterBar}>
                    <input
                        type="text"
                        placeholder="Pesquisar por nome, cor ou material..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                    <select
                        value={materialFilter}
                        onChange={(e) => setMaterialFilter(e.target.value)}
                        className={styles.selectFilter}
                    >
                        <option value="all">Material: todos</option>
                        <option value="PLA">PLA</option>
                        <option value="ABS">ABS</option>
                        <option value="PETG">PETG</option>
                        <option value="Resina">Resina</option>
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className={styles.selectFilter}
                    >
                        <option value="all">Status: todos</option>
                        <option value="Em Estoque">Em Estoque</option>
                        <option value="Baixo Estoque">Baixo Estoque</option>
                        <option value="Esgotado">Esgotado</option>
                    </select>
                </div>

                {loading ? (
                    <div className={styles.loadingBox}>Carregando insumos...</div>
                ) : (
                    <div className={styles.tableScroll}>
                        <table className={styles.table}>
                            <thead>
                                <tr className={styles.thRow}>
                                    <th className={styles.th}>ID</th>
                                    <th className={styles.th}>INSUMO / FILAMENTO</th>
                                    <th className={styles.th}>MATERIAL</th>
                                    <th className={styles.th}>COR</th>
                                    <th className={styles.th}>COMPRA (KG)</th>
                                    <th className={styles.th}>ESTOQUE ATUAL (G)</th>
                                    <th className={styles.th}>STATUS</th>
                                    <th className={styles.th}>AÇÕES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSupplies.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className={styles.emptyCell}>
                                            Nenhum insumo encontrado.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredSupplies.map((item, index) => {
                                        let badgeClass = styles.badgeActive;
                                        if (item.status === 'Baixo Estoque' || item.current_stock_grams <= 200) badgeClass = styles.badgeWarning;
                                        if (item.status === 'Esgotado' || item.current_stock_grams <= 0) badgeClass = styles.badgeInactive;

                                        return (
                                            <tr key={item.id || index} className={styles.tr}>
                                                <td className={styles.td}>#{String(index + 1).padStart(3, '0')}</td>
                                                <td className={`${styles.td} ${styles.tdName}`}>{item.name}</td>
                                                <td className={styles.td}>{item.material || 'PLA'}</td>
                                                <td className={styles.td}>{item.color || 'Preto'}</td>
                                                <td className={styles.td}>{item.purchase_kg ? `${item.purchase_kg} Kg` : '1 Kg'}</td>
                                                <td className={`${styles.td} ${styles.tdStrong}`}>
                                                    {item.current_stock_grams != null ? `${item.current_stock_grams}g` : '1000g'}
                                                </td>
                                                <td className={styles.td}>
                                                    <span className={`${styles.badge} ${badgeClass}`}>
                                                        ● {item.current_stock_grams <= 0 ? 'Esgotado' : item.current_stock_grams <= 200 ? 'Baixo Estoque' : 'Em Estoque'}
                                                    </span>
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
                            <h3 className={styles.modalTitle}>Gerenciar Insumo</h3>
                            <button onClick={handleCloseModal} className={styles.closeBtn}>✕</button>
                        </div>

                        <form onSubmit={handleSaveEdit} className={styles.modalForm}>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Nome do Suprimento:</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    required
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Tipo de Material:</label>
                                <select
                                    value={editMaterial}
                                    onChange={(e) => setEditMaterial(e.target.value)}
                                    className={styles.input}
                                >
                                    <option value="PLA">PLA</option>
                                    <option value="ABS">ABS</option>
                                    <option value="PETG">PETG</option>
                                    <option value="Resina">Resina (SLA)</option>
                                    <option value="Outro">Outro</option>
                                </select>
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Cor / Acabamento:</label>
                                <input
                                    type="text"
                                    value={editColor}
                                    onChange={(e) => setEditColor(e.target.value)}
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Estoque Atual (Gramas/g):</label>
                                <input
                                    type="number"
                                    value={editCurrentStockGrams}
                                    onChange={(e) => setEditCurrentStockGrams(e.target.value)}
                                    required
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Situação do Estoque:</label>
                                <select
                                    value={editStatus}
                                    onChange={(e) => setEditStatus(e.target.value)}
                                    className={styles.input}
                                >
                                    <option value="Em Estoque">Em Estoque</option>
                                    <option value="Baixo Estoque">Baixo Estoque</option>
                                    <option value="Esgotado">Esgotado</option>
                                </select>
                            </div>

                            <div className={styles.modalFooter}>
                                <button
                                    type="button"
                                    onClick={handleDeleteSupply}
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
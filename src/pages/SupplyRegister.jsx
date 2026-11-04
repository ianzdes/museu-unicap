import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { styles } from '../styles/reportStyles';

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
    const [purchaseKg, setPurchaseKg] = useState('1');
    const [currentStockGrams, setCurrentStockGrams] = useState('1000');
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
            setPurchaseKg('1');
            setCurrentStockGrams('1000');
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
            <div style={styles.card}>
                <div style={styles.formHeader}>
                    <h2>Novo Suprimento / Insumo</h2>
                    <button onClick={() => setView('list')} style={styles.backButton}>
                        ← Voltar para a lista
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Nome do Suprimento / Filamento:</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            style={styles.input}
                            placeholder="Ex: Filamento PLA Premium 1.75mm"
                        /> 
                    </div>

                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Tipo de Material:</label>
                        <select
                            value={material}
                            onChange={(e) => setMaterial(e.target.value)}
                            style={styles.input}
                        >
                            <option value="PLA">PLA</option>
                            <option value="ABS">ABS</option>
                            <option value="PETG">PETG</option>
                            <option value="Resina">Resina (SLA)</option>
                            <option value="Outro">Outro</option>
                        </select>
                    </div>

                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Cor / Acabamento:</label>
                        <input
                            type="text"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            style={styles.input}
                            placeholder="Ex: Preto, Branco, Transparente"
                        />
                    </div>

                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Quantidade Comprada (em Kg):</label>
                        <input
                            type="number"
                            step="0.1"
                            value={purchaseKg}
                            onChange={(e) => {
                                setPurchaseKg(e.target.value);
                                setCurrentStockGrams(String(Number(e.target.value) * 1000));
                            }}
                            required
                            style={styles.input}
                            placeholder="Ex: 1 (para rolo de 1kg)"
                        />
                    </div>

                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Estoque Atual Fracionado (em Gramas/g):</label>
                        <input
                            type="number"
                            value={currentStockGrams}
                            onChange={(e) => setCurrentStockGrams(e.target.value)}
                            required
                            style={styles.input}
                            placeholder="Ex: 850 (restante do rolo)"
                        />
                    </div>

                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Situação do Estoque:</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            style={styles.input}
                        >
                            <option value="Em Estoque">Em Estoque</option>
                            <option value="Baixo Estoque">Baixo Estoque</option>
                            <option value="Esgotado">Esgotado</option>
                        </select>
                    </div>

                    <button type="submit" disabled={submitting} style={styles.submitButton}>
                        {submitting ? 'Salvando...' : 'Salvar Insumo'}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.headerRow}>
                <div>
                    <span style={styles.miniCategory}>ESTOQUE & INSUMOS</span>
                    <h2 style={styles.title}>Suprimentos de Impressão</h2>
                    <p style={styles.subtitle}>Gerencie rolos de filamento, resinas e controle de consumo fracionado.</p>
                </div>
                <button onClick={() => setView('form')} style={styles.newButton}>
                    + Novo insumo
                </button>
            </div>

            <div style={styles.tableCard}>
                <div style={styles.filterBar}>
                    <input
                        type="text"
                        placeholder="Pesquisar por nome, cor ou material..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={styles.searchInput}
                    />
                    <select 
                        value={materialFilter} 
                        onChange={(e) => setMaterialFilter(e.target.value)}
                        style={styles.selectFilter}
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
                        style={styles.selectFilter}
                    >
                        <option value="all">Status: todos</option>
                        <option value="Em Estoque">Em Estoque</option>
                        <option value="Baixo Estoque">Baixo Estoque</option>
                        <option value="Esgotado">Esgotado</option>
                    </select>
                </div>

                {loading ? (
                    <div style={{ padding: '30px', textAlign: 'center', color: '#7f8c8d' }}>Carregando insumos...</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.thRow}>
                                    <th style={styles.th}>ID</th>
                                    <th style={styles.th}>INSEMO / FILAMENTO</th>
                                    <th style={styles.th}>MATERIAL</th>
                                    <th style={styles.th}>COR</th>
                                    <th style={styles.th}>COMPRA (KG)</th>
                                    <th style={styles.th}>ESTOQUE ATUAL (G)</th>
                                    <th style={styles.th}>STATUS</th>
                                    <th style={styles.th}>AÇÕES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSupplies.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" style={{ padding: '20px', textAlign: 'center', color: '#7f8c8d' }}>
                                            Nenhum insumo encontrado.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredSupplies.map((item, index) => {
                                        let badgeStyle = styles.badgeDisponivel;
                                        if (item.status === 'Baixo Estoque' || item.current_stock_grams <= 200) badgeStyle = styles.badgeBaixo;
                                        if (item.status === 'Esgotado' || item.current_stock_grams <= 0) badgeStyle = styles.badgeEsgotado;

                                        return (
                                            <tr key={item.id || index} style={styles.tr}>
                                                <td style={styles.td}>#{String(index + 1).padStart(3, '0')}</td>
                                                <td style={{...styles.td, fontWeight: '500'}}>{item.name}</td>
                                                <td style={styles.td}>{item.material || 'PLA'}</td>
                                                <td style={styles.td}>{item.color || 'Preto'}</td>
                                                <td style={styles.td}>{item.purchase_kg ? `${item.purchase_kg} Kg` : '1 Kg'}</td>
                                                <td style={{...styles.td, fontWeight: 'bold'}}>
                                                    {item.current_stock_grams != null ? `${item.current_stock_grams}g` : '1000g'}
                                                </td>
                                                <td style={styles.td}>
                                                    <span style={badgeStyle}>
                                                        ● {item.current_stock_grams <= 0 ? 'Esgotado' : item.current_stock_grams <= 200 ? 'Baixo Estoque' : 'Em Estoque'}
                                                    </span>
                                                </td>
                                                <td style={styles.td}>
                                                    <button 
                                                        onClick={() => handleOpenModal(item)}
                                                        style={styles.actionBtn}
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
                <div style={modalStyles.overlay}>
                    <div style={modalStyles.card}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                            <h3 style={{ margin: 0, color: '#1a1a1a', fontSize: '18px' }}>Gerenciar Insumo</h3>
                            <button onClick={handleCloseModal} style={modalStyles.closeBtn}>✕</button>
                        </div>

                        <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Nome do Suprimento:</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    required
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Tipo de Material:</label>
                                <select
                                    value={editMaterial}
                                    onChange={(e) => setEditMaterial(e.target.value)}
                                    style={styles.input}
                                >
                                    <option value="PLA">PLA</option>
                                    <option value="ABS">ABS</option>
                                    <option value="PETG">PETG</option>
                                    <option value="Resina">Resina (SLA)</option>
                                    <option value="Outro">Outro</option>
                                </select>
                            </div>

                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Cor / Acabamento:</label>
                                <input
                                    type="text"
                                    value={editColor}
                                    onChange={(e) => setEditColor(e.target.value)}
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Estoque Atual (Gramas/g):</label>
                                <input
                                    type="number"
                                    value={editCurrentStockGrams}
                                    onChange={(e) => setEditCurrentStockGrams(e.target.value)}
                                    required
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Situação do Estoque:</label>
                                <select
                                    value={editStatus}
                                    onChange={(e) => setEditStatus(e.target.value)}
                                    style={styles.input}
                                >
                                    <option value="Em Estoque">Em Estoque</option>
                                    <option value="Baixo Estoque">Baixo Estoque</option>
                                    <option value="Esgotado">Esgotado</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                                <button 
                                    type="button" 
                                    onClick={handleDeleteSupply} 
                                    disabled={actionLoading}
                                    style={modalStyles.deleteBtn}
                                >
                                    🗑️ Deletar
                                </button>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button 
                                        type="button" 
                                        onClick={handleCloseModal} 
                                        style={modalStyles.cancelBtn}
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={actionLoading}
                                        style={styles.submitButton}
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

// Estilos específicos da caixa de diálogo (modal)
const modalStyles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000,
        padding: '20px',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '450px',
        padding: '24px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        fontFamily: 'sans-serif',
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        fontSize: '16px',
        cursor: 'pointer',
        color: '#64748b',
    },
    deleteBtn: {
        backgroundColor: '#fee2e2',
        color: '#991b1b',
        border: '1px solid #fca5a5',
        padding: '8px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '500',
    },
    cancelBtn: {
        backgroundColor: '#f1f5f9',
        color: '#334155',
        border: '1px solid #cbd5e1',
        padding: '8px 14px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '13px',
    }
};
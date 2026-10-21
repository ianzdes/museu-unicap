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
                                                        onClick={() => alert(`Detalhes do insumo: ${item.name}`)}
                                                        style={styles.actionBtn}
                                                    >
                                                        Ver detalhes
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
        </div>
    );
}
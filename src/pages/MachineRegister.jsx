import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { styles } from '../styles/reportStyles';

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
    const [supplyLevel, setSupplyLevel] = useState('100%');
    const [submitting, setSubmitting] = useState(false);

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
            setSupplyLevel('100%');
            setView('list');
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
            <div style={styles.card}>
                <div style={styles.formHeader}>
                    <h2>Novo Equipamento</h2>
                    <button onClick={() => setView('list')} style={styles.backButton}>
                        ← Voltar para a lista
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Código de Patrimônio:</label>
                        <input
                            type="text"
                            value={assetCode}
                            onChange={(e) => setAssetCode(e.target.value)}
                            style={styles.input}
                            placeholder="Ex: PAT-105"
                        /> 
                    </div>

                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Nome do Equipamento:</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            style={styles.input}
                            placeholder="Ex: Impressora 3D Ender 3"
                        />
                    </div>

                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Categoria:</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            style={styles.input}
                        >
                            <option value="Eletrônico">Eletrônico</option>
                            <option value="Digitalização">Digitalização</option>
                            <option value="Audiovisual">Audiovisual</option>
                            <option value="Impressão 3D">Impressão 3D</option>
                        </select>
                    </div>

                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Condição:</label>
                        <select
                            value={condition}
                            onChange={(e) => setCondition(e.target.value)}
                            style={styles.input}
                        >
                            <option value="Excelente">Excelente</option>
                            <option value="Boa">Boa</option>
                            <option value="Regular">Regular</option>
                            <option value="Ruim">Ruim</option>
                        </select>
                    </div>

                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Situação Inicial:</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            style={styles.input}
                        >
                            <option value="Disponível">Disponível</option>
                            <option value="Emprestado">Emprestado</option>
                            <option value="Manutenção">Manutenção</option>
                        </select>
                    </div>

                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Última Manutenção:</label>
                        <input
                            type="date"
                            value={lastMaintenance}
                            onChange={(e) => setLastMaintenance(e.target.value)}
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Nível de Insumo / Filamento:</label>
                        <input
                            type="text"
                            value={supplyLevel}
                            onChange={(e) => setSupplyLevel(e.target.value)}
                            placeholder="Ex: 80% ou 500g"
                            style={styles.input}
                        />
                    </div>

                    <button type="submit" disabled={submitting} style={styles.submitButton}>
                        {submitting ? 'Salvando...' : 'Salvar Equipamento'}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.headerRow}>
                <div>
                    <span style={styles.miniCategory}>PATRIMÔNIO</span>
                    <h2 style={styles.title}>Equipamentos</h2>
                    <p style={styles.subtitle}>Consulte disponibilidade, condição e situação dos equipamentos.</p>
                </div>
                <button onClick={() => setView('form')} style={styles.newButton}>
                    + Novo equipamento
                </button>
            </div>

            <div style={styles.tableCard}>
                <div style={styles.filterBar}>
                    <input
                        type="text"
                        placeholder="Pesquisar por nome, código ou patrimônio..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={styles.searchInput}
                    />
                    <select 
                        value={categoryFilter} 
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        style={styles.selectFilter}
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
                        style={styles.selectFilter}
                    >
                        <option value="all">Situação: todos</option>
                        <option value="Disponível">Disponível</option>
                        <option value="Emprestado">Emprestado</option>
                        <option value="Manutenção">Manutenção</option>
                    </select>
                    <select 
                        value={conditionFilter} 
                        onChange={(e) => setConditionFilter(e.target.value)}
                        style={styles.selectFilter}
                    >
                        <option value="all">Condição: todos</option>
                        <option value="Boa">Boa</option>
                        <option value="Regular">Regular</option>
                        <option value="Excelente">Excelente</option>
                    </select>
                </div>

                {loading ? (
                    <div style={{ padding: '30px', textAlign: 'center', color: '#7f8c8d' }}>Carregando equipamentos...</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.thRow}>
                                    <th style={styles.th}>PATRIMÔNIO</th>
                                    <th style={styles.th}>EQUIPAMENTO</th>
                                    <th style={styles.th}>CATEGORIA</th>
                                    <th style={styles.th}>CONDIÇÃO</th>
                                    <th style={styles.th}>SITUAÇÃO</th>
                                    <th style={styles.th}>ÚLTIMA MANUTENÇÃO</th>
                                    <th style={styles.th}>INSUMO</th>
                                    <th style={styles.th}>AÇÕES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEquipments.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" style={{ padding: '20px', textAlign: 'center', color: '#7f8c8d' }}>
                                            Nenhum equipamento encontrado.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredEquipments.map((item, index) => {
                                        let badgeStyle = styles.badgeDisponivel;
                                        if (item.status === 'Emprestado') badgeStyle = styles.badgeEmprestado;
                                        if (item.status === 'Manutenção') badgeStyle = styles.badgeManutencao;

                                        return (
                                            <tr key={item.id || index} style={styles.tr}>
                                                <td style={{...styles.td, color: '#64748b', fontSize: '13px'}}>{item.asset_code || `PAT-${101 + index}`}</td>
                                                <td style={{...styles.td, fontWeight: '500'}}>{item.name}</td>
                                                <td style={styles.td}>{item.category}</td>
                                                <td style={styles.td}>{item.condition || 'Boa'}</td>
                                                <td style={styles.td}>
                                                    <span style={badgeStyle}>
                                                        ● {item.status || 'Disponível'}
                                                    </span>
                                                </td>
                                                <td style={styles.td}>
                                                    {item.last_maintenance ? new Date(item.last_maintenance).toLocaleDateString('pt-BR') : '—'}
                                                </td>
                                                <td style={styles.td}>{item.supply_level || '100%'}</td>
                                                <td style={styles.td}>
                                                    <button 
                                                        onClick={() => alert(`Detalhes do equipamento: ${item.name}`)}
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
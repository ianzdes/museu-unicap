import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { styles } from '../styles/reportStyles';

export function LoanRegister() {
    const [view, setView] = useState('list'); 
    
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const [equipmentName, setEquipmentName] = useState('');
    const [clientName, setClientName] = useState('');
    const [loanDate, setLoanDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchLoans();
    }, []);

    const fetchLoans = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('loans')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao buscar empréstimos:', error.message);
        } else {
            setLoans(data || []);
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (equipmentName.trim().length < 2) {
            alert("Informe o nome/patrimônio do equipamento.");
            return;
        }

        if (clientName.trim().length < 2) {
            alert("Informe o nome do cliente/solicitante.");
            return;
        }

        setSubmitting(true);

        const { error } = await supabase
            .from('loans')
            .insert([
                {
                    equipment_name: equipmentName,
                    client_name: clientName,
                    loan_date: loanDate,
                    due_date: dueDate || null,
                    status: 'Ativo',
                    notes: notes || null
                }
            ]);

        setSubmitting(false);

        if (error) {
            alert(`Erro ao registrar empréstimo: ${error.message}`);
        } else {
            alert(`Empréstimo do equipamento "${equipmentName}" para ${clientName} registrado com sucesso!`);
            setEquipmentName('');
            setClientName('');
            setLoanDate(new Date().toISOString().split('T')[0]);
            setDueDate('');
            setNotes('');
            setView('list');
            fetchLoans();
        }
    };

    const handleReturn = async (loanId) => {
        if (!confirm("Confirmar a devolução deste equipamento?")) return;

        const { error } = await supabase
            .from('loans')
            .update({ 
                status: 'Devolvido',
                return_date: new Date().toISOString().split('T')[0]
            })
            .eq('id', loanId);

        if (error) {
            alert(`Erro ao atualizar devolução: ${error.message}`);
        } else {
            alert("Devolução realizada com sucesso!");
            fetchLoans();
        }
    };

    const filteredLoans = loans.filter((item) => {
        const matchesSearch = item.equipment_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              item.client_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    if (view === 'form') {
        return (
            <div style={styles.card}>
                <div style={styles.formHeader}>
                    <h2>Novo Empréstimo</h2>
                    <button onClick={() => setView('list')} style={styles.backButton}>
                        ← Voltar para a lista
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Equipamento / Patrimônio:</label>
                        <input
                            type="text"
                            value={equipmentName}
                            onChange={(e) => setEquipmentName(e.target.value)}
                            required
                            style={styles.input}
                            placeholder="Ex: Tablet Samsung (PAT-101) ou Mesa Digitalizadora"
                        /> 
                    </div>

                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Cliente / Solicitante:</label>
                        <input
                            type="text"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            required
                            style={styles.input}
                            placeholder="Ex: João Silva (Aluno)"
                        />
                    </div>

                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Data de Empréstimo:</label>
                        <input
                            type="date"
                            value={loanDate}
                            onChange={(e) => setLoanDate(e.target.value)}
                            required
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Data Prevista de Devolução:</label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            required
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Observações / Finalidade (Opcional):</label>
                        <input
                            type="text"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            style={styles.input}
                            placeholder="Ex: Uso na oficina de modelagem"
                        />
                    </div>

                    <button type="submit" disabled={submitting} style={styles.submitButton}>
                        {submitting ? 'Salvando...' : 'Registrar Empréstimo'}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.headerRow}>
                <div>
                    <span style={styles.miniCategory}>CIRCULAÇÃO & EMPRÉSTIMOS</span>
                    <h2 style={styles.title}>Empréstimos de Equipamentos</h2>
                    <p style={styles.subtitle}>Acompanhe o status, prazo de devolução e disponibilidade de equipamentos emprestados.</p>
                </div>
                <button onClick={() => setView('form')} style={styles.newButton}>
                    + Novo empréstimo
                </button>
            </div>

            <div style={styles.tableCard}>
                <div style={styles.filterBar}>
                    <input
                        type="text"
                        placeholder="Pesquisar por equipamento ou cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={styles.searchInput}
                    />
                    <select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={styles.selectFilter}
                    >
                        <option value="all">Status: todos</option>
                        <option value="Ativo">Empréstimo Ativo</option>
                        <option value="Devolvido">Devolvido</option>
                        <option value="Atrasado">Atrasado</option>
                    </select>
                </div>

                {loading ? (
                    <div style={{ padding: '30px', textAlign: 'center', color: '#7f8c8d' }}>Carregando empréstimos...</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.thRow}>
                                    <th style={styles.th}>ID</th>
                                    <th style={styles.th}>EQUIPAMENTO</th>
                                    <th style={styles.th}>CLIENTE / LEITOR</th>
                                    <th style={styles.th}>DATA RETIRADA</th>
                                    <th style={styles.th}>PREV. DEVOLUÇÃO</th>
                                    <th style={styles.th}>STATUS</th>
                                    <th style={styles.th}>AÇÕES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLoans.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#7f8c8d' }}>
                                            Nenhum empréstimo encontrado.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLoans.map((item, index) => {
                                        let badgeStyle = styles.badgeAtivo;
                                        if (item.status === 'Devolvido') badgeStyle = styles.badgeDevolvido;
                                        if (item.status === 'Atrasado') badgeStyle = styles.badgeAtrasado;

                                        return (
                                            <tr key={item.id || index} style={styles.tr}>
                                                <td style={styles.td}>#{String(index + 1).padStart(3, '0')}</td>
                                                <td style={{...styles.td, fontWeight: '500'}}>{item.equipment_name}</td>
                                                <td style={styles.td}>{item.client_name}</td>
                                                <td style={styles.td}>
                                                    {item.loan_date ? new Date(item.loan_date).toLocaleDateString('pt-BR') : '—'}
                                                </td>
                                                <td style={styles.td}>
                                                    {item.due_date ? new Date(item.due_date).toLocaleDateString('pt-BR') : '—'}
                                                </td>
                                                <td style={styles.td}>
                                                    <span style={badgeStyle}>
                                                        ● {item.status || 'Ativo'}
                                                    </span>
                                                </td>
                                                <td style={{...styles.td, display: 'flex', gap: '8px'}}>
                                                    {item.status !== 'Devolvido' && (
                                                        <button 
                                                            onClick={() => handleReturn(item.id)}
                                                            style={styles.returnBtn}
                                                        >
                                                            Dar baixa
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => alert(`Detalhes do empréstimo: ${item.equipment_name} para ${item.client_name}`)}
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
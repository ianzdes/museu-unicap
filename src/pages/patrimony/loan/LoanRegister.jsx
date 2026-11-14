import { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import styles from './LoanRegister.module.css';

const STATUS_BADGE_CLASS = {
    Ativo: styles.badgeInfo,
    Devolvido: styles.badgeActive,
    Atrasado: styles.badgeInactive,
};

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

    // estados para controlar o modal de detalhes
    const [selectedLoan, setSelectedLoan] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editEquipmentName, setEditEquipmentName] = useState('');
    const [editClientName, setEditClientName] = useState('');
    const [editDueDate, setEditDueDate] = useState('');
    const [editStatus, setEditStatus] = useState('Ativo');
    const [editNotes, setEditNotes] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

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

    // funções do modal
    const handleOpenModal = (item) => {
        setSelectedLoan(item);
        setEditEquipmentName(item.equipment_name || '');
        setEditClientName(item.client_name || '');
        setEditDueDate(item.due_date || '');
        setEditStatus(item.status || 'Ativo');
        setEditNotes(item.notes || '');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedLoan(null);
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        if (!selectedLoan) return;

        setActionLoading(true);
        const { error } = await supabase
            .from('loans')
            .update({
                equipment_name: editEquipmentName,
                client_name: editClientName,
                due_date: editDueDate || null,
                status: editStatus,
                notes: editNotes || null
            })
            .eq('id', selectedLoan.id);

        setActionLoading(false);

        if (error) {
            alert(`Erro ao atualizar empréstimo: ${error.message}`);
        } else {
            alert('Empréstimo atualizado com sucesso!');
            handleCloseModal();
            fetchLoans();
        }
    };

    const handleDeleteLoan = async () => {
        if (!selectedLoan) return;
        if (!window.confirm("Tem certeza que deseja excluir este registro de empréstimo?")) return;

        setActionLoading(true);
        const { error } = await supabase
            .from('loans')
            .delete()
            .eq('id', selectedLoan.id);

        setActionLoading(false);

        if (error) {
            alert(`Erro ao excluir empréstimo: ${error.message}`);
        } else {
            alert('Empréstimo excluído com sucesso!');
            handleCloseModal();
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
            <div className={styles.card}>
                <div className={styles.formHeader}>
                    <h2>Novo Empréstimo</h2>
                    <button onClick={() => setView('list')} className={styles.backButton}>
                        ← Voltar para a lista
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Equipamento / Patrimônio:</label>
                        <input
                            type="text"
                            value={equipmentName}
                            onChange={(e) => setEquipmentName(e.target.value)}
                            required
                            className={styles.input}
                            placeholder="Ex: Tablet Samsung (PAT-101) ou Mesa Digitalizadora"
                        />
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Cliente / Solicitante:</label>
                        <input
                            type="text"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            required
                            className={styles.input}
                            placeholder="Ex: João Silva (Aluno)"
                        />
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Data de Empréstimo:</label>
                        <input
                            type="date"
                            value={loanDate}
                            onChange={(e) => setLoanDate(e.target.value)}
                            required
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Data Prevista de Devolução:</label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            required
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Observações / Finalidade (Opcional):</label>
                        <input
                            type="text"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className={styles.input}
                            placeholder="Ex: Uso na oficina de modelagem"
                        />
                    </div>

                    <button type="submit" disabled={submitting} className={styles.submitButton}>
                        {submitting ? 'Salvando...' : 'Registrar Empréstimo'}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.headerRow}>
                <div>
                    <span className={styles.miniCategory}>CIRCULAÇÃO & EMPRÉSTIMOS</span>
                    <h2 className={styles.title}>Empréstimos de Equipamentos</h2>
                    <p className={styles.subtitle}>Acompanhe o status, prazo de devolução e disponibilidade de equipamentos emprestados.</p>
                </div>
                <button onClick={() => setView('form')} className={styles.newButton}>
                    + Novo empréstimo
                </button>
            </div>

            <div className={styles.tableCard}>
                <div className={styles.filterBar}>
                    <input
                        type="text"
                        placeholder="Pesquisar por equipamento ou cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className={styles.selectFilter}
                    >
                        <option value="all">Status: todos</option>
                        <option value="Ativo">Empréstimo Ativo</option>
                        <option value="Devolvido">Devolvido</option>
                        <option value="Atrasado">Atrasado</option>
                    </select>
                </div>

                {loading ? (
                    <div className={styles.loadingBox}>Carregando empréstimos...</div>
                ) : (
                    <div className={styles.tableScroll}>
                        <table className={styles.table}>
                            <thead>
                                <tr className={styles.thRow}>
                                    <th className={styles.th}>ID</th>
                                    <th className={styles.th}>EQUIPAMENTO</th>
                                    <th className={styles.th}>CLIENTE / LEITOR</th>
                                    <th className={styles.th}>DATA RETIRADA</th>
                                    <th className={styles.th}>PREV. DEVOLUÇÃO</th>
                                    <th className={styles.th}>STATUS</th>
                                    <th className={styles.th}>AÇÕES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLoans.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className={styles.emptyCell}>
                                            Nenhum empréstimo encontrado.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLoans.map((item, index) => {
                                        const badgeClass = STATUS_BADGE_CLASS[item.status] || styles.badgeInfo;

                                        return (
                                            <tr key={item.id || index} className={styles.tr}>
                                                <td className={styles.td}>#{String(index + 1).padStart(3, '0')}</td>
                                                <td className={`${styles.td} ${styles.tdEquipment}`}>{item.equipment_name}</td>
                                                <td className={styles.td}>{item.client_name}</td>
                                                <td className={styles.td}>
                                                    {item.loan_date ? new Date(item.loan_date).toLocaleDateString('pt-BR') : '—'}
                                                </td>
                                                <td className={styles.td}>
                                                    {item.due_date ? new Date(item.due_date).toLocaleDateString('pt-BR') : '—'}
                                                </td>
                                                <td className={styles.td}>
                                                    <span className={`${styles.badge} ${badgeClass}`}>
                                                        ● {item.status || 'Ativo'}
                                                    </span>
                                                </td>
                                                <td className={styles.td}>
                                                    <div className={styles.actions}>
                                                        {item.status !== 'Devolvido' && (
                                                            <button
                                                                onClick={() => handleReturn(item.id)}
                                                                className={styles.successBtn}
                                                            >
                                                                Dar baixa
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleOpenModal(item)}
                                                            className={styles.actionBtn}
                                                        >
                                                            Gerenciar
                                                        </button>
                                                    </div>
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
                            <h3 className={styles.modalTitle}>Gerenciar Empréstimo</h3>
                            <button onClick={handleCloseModal} className={styles.closeBtn}>✕</button>
                        </div>

                        <form onSubmit={handleSaveEdit} className={styles.modalForm}>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Equipamento / Patrimônio:</label>
                                <input
                                    type="text"
                                    value={editEquipmentName}
                                    onChange={(e) => setEditEquipmentName(e.target.value)}
                                    required
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Cliente / Solicitante:</label>
                                <input
                                    type="text"
                                    value={editClientName}
                                    onChange={(e) => setEditClientName(e.target.value)}
                                    required
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Data Prevista de Devolução:</label>
                                <input
                                    type="date"
                                    value={editDueDate}
                                    onChange={(e) => setEditDueDate(e.target.value)}
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Status:</label>
                                <select
                                    value={editStatus}
                                    onChange={(e) => setEditStatus(e.target.value)}
                                    className={styles.input}
                                >
                                    <option value="Ativo">Ativo</option>
                                    <option value="Devolvido">Devolvido</option>
                                    <option value="Atrasado">Atrasado</option>
                                </select>
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Observações:</label>
                                <input
                                    type="text"
                                    value={editNotes}
                                    onChange={(e) => setEditNotes(e.target.value)}
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.modalFooter}>
                                <button
                                    type="button"
                                    onClick={handleDeleteLoan}
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
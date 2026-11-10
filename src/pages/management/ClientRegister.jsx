import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import styles from './ClientRegister.module.css';

export function ClientRegister() {
    const [view, setView] = useState('list'); 
    
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

    const [name, setName] = useState('');
    const [contact, setContact] = useState('');
    const [clientType, setClientType] = useState('Aluno');
    const [submitting, setSubmitting] = useState(false);

    // estados para controlar o modal de detalhes
    const [selectedClient, setSelectedClient] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editName, setEditName] = useState('');
    const [editContact, setEditContact] = useState('');
    const [editClientType, setEditClientType] = useState('Aluno');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao buscar clientes:', error.message);
        } else {
            setClients(data || []);
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (name.trim().length < 3) {
            alert("O nome deve ter no mínimo 3 caracteres!");
            return;
        }

        if (contact.trim().length < 8) {
            alert("Insira um contato válido.");
            return;
        }

        setSubmitting(true);

        const { error } = await supabase
            .from('clients')
            .insert([
                {
                    name,
                    contact,
                    type: clientType,
                    last_loan: null
                }
            ]);

        setSubmitting(false);

        if (error) {
            alert(`Erro ao registrar cliente: ${error.message}`);
        } else {
            alert(`Cliente ${name} cadastrado com sucesso!`);
            setName('');
            setContact('');
            setClientType('Aluno');
            setView('list');
            fetchClients();
        }
    };

    // funções do modal
    const handleOpenModal = (client) => {
        setSelectedClient(client);
        setEditName(client.name || '');
        setEditContact(client.contact || '');
        setEditClientType(client.type || 'Aluno');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedClient(null);
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        if (!selectedClient) return;

        setActionLoading(true);
        const { error } = await supabase
            .from('clients')
            .update({
                name: editName,
                contact: editContact,
                type: editClientType
            })
            .eq('id', selectedClient.id);

        setActionLoading(false);

        if (error) {
            alert(`Erro ao atualizar cliente: ${error.message}`);
        } else {
            alert('Cliente atualizado com sucesso!');
            handleCloseModal();
            fetchClients();
        }
    };

    const handleDeleteClient = async () => {
        if (!selectedClient) return;
        if (!window.confirm(`Tem certeza que deseja excluir o cliente ${selectedClient.name}?`)) return;

        setActionLoading(true);
        const { error } = await supabase
            .from('clients')
            .delete()
            .eq('id', selectedClient.id);

        setActionLoading(false);

        if (error) {
            alert(`Erro ao excluir cliente: ${error.message}`);
        } else {
            alert('Cliente excluído com sucesso!');
            handleCloseModal();
            fetchClients();
        }
    };

    const filteredClients = clients.filter((client) => {
        const matchesSearch = client.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              client.contact?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || client.type === typeFilter;
        return matchesSearch && matchesType;
    });

    if (view === 'form') {
        return (
            <div className={styles.card}>
                <div className={styles.formHeader}>
                    <h2>Novo Cliente</h2>
                    <button onClick={() => setView('list')} className={styles.backButton}>
                        ← Voltar para a lista
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Nome Completo:</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className={styles.input}
                            placeholder="Ex: João Silva"
                        /> 
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Contato (Telefone / WhatsApp):</label>
                        <input
                            type="text"
                            value={contact}
                            onChange={(e) => setContact(e.target.value)}
                            required
                            className={styles.input}
                            placeholder="(81) 99999-2001"
                        />
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Tipo de Cliente:</label>
                        <select
                            value={clientType}
                            onChange={(e) => setClientType(e.target.value)}
                            className={styles.input}
                        >
                            <option value="Aluno">Aluno</option>
                            <option value="Visitante">Visitante</option>
                        </select>
                    </div>

                    <button type="submit" disabled={submitting} className={styles.submitButton}>
                        {submitting ? 'Salvando...' : 'Salvar Cliente'}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.headerRow}>
                <div>
                    <span className={styles.miniCategory}>ATENDIMENTO</span>
                    <h2 className={styles.title}>Clientes</h2>
                    <p className={styles.subtitle}>Cadastros de alunos e visitantes atendidos pelo museu.</p>
                </div>
                <button onClick={() => setView('form')} className={styles.newButton}>
                    + Novo cliente
                </button>
            </div>

            <div className={styles.tableCard}>
                <div className={styles.filterBar}>
                    <input
                        type="text"
                        placeholder="Pesquisar por nome ou contato..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                    <select 
                        value={typeFilter} 
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className={styles.selectFilter}
                    >
                        <option value="all">Tipo de cliente: todos</option>
                        <option value="Aluno">Aluno</option>
                        <option value="Visitante">Visitante</option>
                    </select>
                </div>

                {loading ? (
                    <div style={{ padding: '30px', textAlign: 'center', color: '#7f8c8d' }}>Carregando clientes...</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className={styles.table}>
                            <thead>
                                <tr className={styles.thRow}>
                                    <th className={styles.th}>ID</th>
                                    <th className={styles.th}>NOME</th>
                                    <th className={styles.th}>CONTATO</th>
                                    <th className={styles.th}>DATA DE REGISTRO</th>
                                    <th className={styles.th}>ÚLTIMO EMPRÉSTIMO</th>
                                    <th className={styles.th}>TIPO</th>
                                    <th className={styles.th}>AÇÕES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredClients.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#7f8c8d' }}>
                                            Nenhum cliente encontrado.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredClients.map((client, index) => {
                                        let badgeStyle = styles.badgeAluno;
                                        if (client.type === 'Visitante') badgeStyle = styles.badgeVisitante;

                                        return (
                                            <tr key={client.id || index} className={styles.tr}>
                                                <td className={styles.td}>#{String(index + 1).padStart(3, '0')}</td>
                                                <td style={{ fontWeight: '500' }} className={styles.td}>{client.name}</td>
                                                <td className={styles.td}>{client.contact}</td>
                                                <td className={styles.td}>
                                                    {client.created_at ? new Date(client.created_at).toLocaleDateString('pt-BR') : '—'}
                                                </td>
                                                <td className={styles.td}>
                                                    {client.last_loan ? new Date(client.last_loan).toLocaleDateString('pt-BR') : '—'}
                                                </td>
                                                <td className={styles.td}>
                                                    <span className={badgeStyle}>
                                                        ● {client.type || 'Aluno'}
                                                    </span>
                                                </td>
                                                <td className={styles.td}>
                                                    <button 
                                                        onClick={() => handleOpenModal(client)}
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
                <div className={styles.overlay}>
                    <div className={styles.card}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                            <h3 style={{ margin: 0, color: '#1a1a1a', fontSize: '18px' }}>Gerenciar Cliente</h3>
                            <button onClick={handleCloseModal} className={styles.closeBtn}>✕</button>
                        </div>

                        <form onSubmit={handleSaveEdit} className={styles.form}>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Nome Completo:</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    required
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Contato (Telefone / WhatsApp):</label>
                                <input
                                    type="text"
                                    value={editContact}
                                    onChange={(e) => setEditContact(e.target.value)}
                                    required
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Tipo de Cliente:</label>
                                <select
                                    value={editClientType}
                                    onChange={(e) => setEditClientType(e.target.value)}
                                    className={styles.input}
                                >
                                    <option value="Aluno">Aluno</option>
                                    <option value="Visitante">Visitante</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                                <button 
                                    type="button" 
                                    onClick={handleDeleteClient} 
                                    disabled={actionLoading}
                                    className={styles.deleteBtn}
                                >
                                    Deletar
                                </button>
                                <div style={{ display: 'flex', gap: '8px' }}>
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
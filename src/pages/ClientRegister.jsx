import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { styles } from '../styles/reportStyles';

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

    const filteredClients = clients.filter((client) => {
        const matchesSearch = client.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              client.contact?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || client.type === typeFilter;
        return matchesSearch && matchesType;
    });

    if (view === 'form') {
        return (
            <div style={styles.card}>
                <div style={styles.formHeader}>
                    <h2>Novo Cliente</h2>
                    <button onClick={() => setView('list')} style={styles.backButton}>
                        ← Voltar para a lista
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Nome Completo:</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            style={styles.input}
                            placeholder="Ex: João Silva"
                        /> 
                    </div>

                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Contato (Telefone / WhatsApp):</label>
                        <input
                            type="text"
                            value={contact}
                            onChange={(e) => setContact(e.target.value)}
                            required
                            style={styles.input}
                            placeholder="(81) 99999-2001"
                        />
                    </div>

                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Tipo de Cliente:</label>
                        <select
                            value={clientType}
                            onChange={(e) => setClientType(e.target.value)}
                            style={styles.input}
                        >
                            <option value="Aluno">Aluno</option>
                            <option value="Visitante">Visitante</option>
                            <option value="Pesquisador">Pesquisador</option>
                        </select>
                    </div>

                    <button type="submit" disabled={submitting} style={styles.submitButton}>
                        {submitting ? 'Salvando...' : 'Salvar Cliente'}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.headerRow}>
                <div>
                    <span style={styles.miniCategory}>ATENDIMENTO</span>
                    <h2 style={styles.title}>Clientes</h2>
                    <p style={styles.subtitle}>Cadastros de alunos, visitantes e pesquisadores atendidos pelo museu.</p>
                </div>
                <button onClick={() => setView('form')} style={styles.newButton}>
                    + Novo cliente
                </button>
            </div>

            <div style={styles.tableCard}>
                <div style={styles.filterBar}>
                    <input
                        type="text"
                        placeholder="Pesquisar por nome ou contato..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={styles.searchInput}
                    />
                    <select 
                        value={typeFilter} 
                        onChange={(e) => setTypeFilter(e.target.value)}
                        style={styles.selectFilter}
                    >
                        <option value="all">Tipo de cliente: todos</option>
                        <option value="Aluno">Aluno</option>
                        <option value="Visitante">Visitante</option>
                        <option value="Pesquisador">Pesquisador</option>
                    </select>
                </div>

                {loading ? (
                    <div style={{ padding: '30px', textAlign: 'center', color: '#7f8c8d' }}>Carregando clientes...</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.thRow}>
                                    <th style={styles.th}>ID</th>
                                    <th style={styles.th}>NOME</th>
                                    <th style={styles.th}>CONTATO</th>
                                    <th style={styles.th}>DATA DE REGISTRO</th>
                                    <th style={styles.th}>ÚLTIMO EMPRÉSTIMO</th>
                                    <th style={styles.th}>TIPO</th>
                                    <th style={styles.th}>AÇÕES</th>
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
                                        if (client.type === 'Pesquisador') badgeStyle = styles.badgePesquisador;

                                        return (
                                            <tr key={client.id || index} style={styles.tr}>
                                                <td style={styles.td}>#{String(index + 1).padStart(3, '0')}</td>
                                                <td style={{...styles.td, fontWeight: '500'}}>{client.name}</td>
                                                <td style={styles.td}>{client.contact}</td>
                                                <td style={styles.td}>
                                                    {client.created_at ? new Date(client.created_at).toLocaleDateString('pt-BR') : '—'}
                                                </td>
                                                <td style={styles.td}>
                                                    {client.last_loan ? new Date(client.last_loan).toLocaleDateString('pt-BR') : '—'}
                                                </td>
                                                <td style={styles.td}>
                                                    <span style={badgeStyle}>
                                                        ● {client.type || 'Aluno'}
                                                    </span>
                                                </td>
                                                <td style={styles.td}>
                                                    <button 
                                                        onClick={() => alert(`Detalhes do cliente: ${client.name}`)}
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
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { styles } from '../styles/reportStyles';

export function UserRegister() {
    const [view, setView] = useState('list'); 
    
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('client');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao buscar usuários:', error.message);
        } else {
            setUsers(data || []);
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (name.trim().length < 3) {
            alert("O nome deve ter no mínimo 3 letras!");
            return;
        }

        const allowedDomain = "@unicap.br";
        if (!email.toLowerCase().endsWith(allowedDomain)) {
            alert(`Apenas e-mails ${allowedDomain} serão aceitos.`);
            return;
        }

        setSubmitting(true);

        const { error } = await supabase
            .from('profiles')
            .insert([
                {
                    name,
                    email,
                    role,
                    status: 'Ativo',
                    last_access: new Date().toISOString()
                }
            ]);

        setSubmitting(false);

        if (error) {
            alert(`Erro ao registrar usuário: ${error.message}`);
        } else {
            alert(`Usuário ${name} cadastrado com sucesso!`);
            setName('');
            setEmail('');
            setRole('client');
            setView('list');
            fetchUsers();
        }
    };

    const filteredUsers = users.filter((user) => {
        const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });

    if (view === 'form') {
        return (
            <div style={styles.card}>
                <div style={styles.formHeader}>
                    <h2>Novo Usuário</h2>
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
                            placeholder="Ex: Cláudio Santos"
                        /> 
                    </div>

                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Endereço de E-mail (@unicap.br):</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={styles.input}
                            placeholder="colaborador@unicap.br"
                        />
                    </div>

                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Perfil / Cargo:</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            style={styles.input}
                        >
                            <option value="client">Cliente / Leitor</option>
                            <option value="technician">Técnico</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>

                    <button type="submit" disabled={submitting} style={styles.submitButton}>
                        {submitting ? 'Salvando...' : 'Salvar Colaborador'}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.headerRow}>
                <div>
                    <span style={styles.miniCategory}>ACESSOS</span>
                    <h2 style={styles.title}>Usuários</h2>
                    <p style={styles.subtitle}>Gerencie perfis internos e acompanhe o último acesso de cada colaborador.</p>
                </div>
                <button onClick={() => setView('form')} style={styles.newButton}>
                    + Novo usuário
                </button>
            </div>

            <div style={styles.tableCard}>
                <div style={styles.filterBar}>
                    <input
                        type="text"
                        placeholder="Pesquisar por nome ou e-mail..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={styles.searchInput}
                    />
                    <select 
                        value={roleFilter} 
                        onChange={(e) => setRoleFilter(e.target.value)}
                        style={styles.selectFilter}
                    >
                        <option value="all">Perfil: todos</option>
                        <option value="admin">Administrador</option>
                        <option value="technician">Técnico</option>
                        <option value="client">Cliente</option>
                    </select>
                    <select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={styles.selectFilter}
                    >
                        <option value="all">Status: todos</option>
                        <option value="Ativo">Ativo</option>
                        <option value="Inativo">Inativo</option>
                    </select>
                </div>

                {loading ? (
                    <div style={{ padding: '30px', textAlign: 'center', color: '#7f8c8d' }}>Carregando usuários...</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.thRow}>
                                    <th style={styles.th}>ID</th>
                                    <th style={styles.th}>NOME</th>
                                    <th style={styles.th}>PERFIL</th>
                                    <th style={styles.th}>STATUS</th>
                                    <th style={styles.th}>ÚLTIMO ACESSO</th>
                                    <th style={styles.th}>AÇÕES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#7f8c8d' }}>
                                            Nenhum usuário encontrado.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user, index) => (
                                        <tr key={user.id || index} style={styles.tr}>
                                            <td style={styles.td}>#{String(index + 1).padStart(2, '0')}</td>
                                            <td style={{...styles.td, fontWeight: '500'}}>{user.name}</td>
                                            <td style={styles.td}>
                                                {user.role === 'admin' ? 'Administrador' : user.role === 'technician' ? 'Técnico' : 'Cliente'}
                                            </td>
                                            <td style={styles.td}>
                                                <span style={user.status === 'Inativo' ? styles.badgeInactive : styles.badgeActive}>
                                                    ● {user.status || 'Ativo'}
                                                </span>
                                            </td>
                                            <td style={styles.td}>
                                                {user.last_access ? new Date(user.last_access).toLocaleDateString('pt-BR') : 'Nunca'}
                                            </td>
                                            <td style={styles.td}>
                                                <button 
                                                    onClick={() => alert(`Detalhes do usuário: ${user.name}`)}
                                                    style={styles.actionBtn}
                                                >
                                                    Ver detalhes
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
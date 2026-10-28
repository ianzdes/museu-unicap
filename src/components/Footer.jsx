import React from 'react';

export function Footer({ onNavigate }) {
    const currentYear = new Date().getFullYear();

    return (
        <footer style={styles.footer}>
            <div style={styles.container}>
                <div style={styles.section}>
                    <h3 style={styles.title}>Museu & Biblioteca</h3>
                    <p style={styles.description}>
                        Sistema integrado de gestão de acervo, laboratório maker, 
                        equipamentos e controle de suprimentos.
                    </p>
                </div>

                <div style={styles.section}>
                    <h4 style={styles.subTitle}>Navegação</h4>
                    <div style={styles.linkList}>
                        <button style={styles.linkButton} onClick={() => onNavigate('home')}>Início</button>
                        <button style={styles.linkButton} onClick={() => onNavigate('users')}>Usuários</button>
                        <button style={styles.linkButton} onClick={() => onNavigate('register:machines')}>Patrimônio</button>
                        <button style={styles.linkButton} onClick={() => onNavigate('contact')}>Contato</button>
                    </div>
                </div>

                <div style={styles.section}>
                    <h4 style={styles.subTitle}>Atendimento & Suporte</h4>
                    <p style={styles.infoText}>localizacao</p>
                    <p style={styles.infoText}>email suporte</p>
                    <p style={styles.infoText}>dia e horario de funcionamento</p>
                </div>
            </div>

            <div style={styles.bottomBar}>
                <p style={styles.copyright}>
                    &copy; {currentYear} Museu & Biblioteca. Todos os direitos reservados.
                </p>
            </div>
        </footer>
    );
}

const styles = {
    footer: {
        backgroundColor: '#4a000d',
        color: '#ffffff',
        fontFamily: 'sans-serif',
        marginTop: 'auto',
        borderTop: '2px solid #8b0000',
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '30px 20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '30px',
    },
    section: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    title: {
        margin: 0,
        fontSize: '18px',
        fontWeight: 'bold',
        letterSpacing: '0.5px',
        color: '#ffffff',
    },
    subTitle: {
        margin: '0 0 6px 0',
        fontSize: '15px',
        fontWeight: 'bold',
        color: '#ffb3b3',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    description: {
        fontSize: '13px',
        color: '#e2e8f0',
        lineHeight: '1.5',
        margin: 0,
    },
    linkList: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '6px',
    },
    linkButton: {
        background: 'none',
        border: 'none',
        color: '#cbd5e1',
        fontSize: '13px',
        cursor: 'pointer',
        padding: 0,
        textAlign: 'left',
        transition: 'color 0.2s',
    },
    infoText: {
        margin: 0,
        fontSize: '13px',
        color: '#cbd5e1',
    },
    bottomBar: {
        backgroundColor: '#330009',
        padding: '15px 20px',
        textAlign: 'center',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    },
    copyright: {
        margin: 0,
        fontSize: '12px',
        color: '#a0aec0',
    },
};
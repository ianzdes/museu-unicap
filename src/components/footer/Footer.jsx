import styles from './Footer.module.css';

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.section}>
                    <h3 className={styles.title}>
                        Museu de Arqueologia e Ciências Naturais
                    </h3>
                    <p className={styles.description}>
                        Sistema integrado de gestão de acervo, laboratório maker,
                        equipamentos e controle de suprimentos.
                    </p>
                </div>

                <div className={styles.section}>
                    <h4 className={styles.subTitle}> Atendimento & Suporte</h4>
                    <p className={styles.infoText}>Localização: R. do Príncipe, 526 - Boa Vista, Recife - PE - 50050-900.</p>
                    <p className={styles.infoText}>E-mail: museu.unicap@unicap.br</p>
                    <p className={styles.infoText}>Segunda à Sexta, das 08h às 17h. Sábados, das 08h às 12h.</p>
                </div>
            </div>

            <div className={styles.bottomBar}>
                <p className={styles.copyright}>
                    &copy; {currentYear} Museu de Arqueologia e Ciências Naturais.
                    Todos os direitos reservados.
                </p>
            </div>
        </footer>
    );
}

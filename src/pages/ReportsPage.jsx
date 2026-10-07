import { useState } from 'react';

export function ReportsPage() {
    // quanto entro na pagina, ela comeca com o valor null. definido por useState(null)
    const [selectedReport, setSelectedReport] = useState(null);

    return (
        <div style={styles.container}>

            {/* lista minimalista apenas cm links de texto */}
            {selectedReport == null && (
              <>
                <h1>Menu de relatórios</h1>

                <ul style={styles.list}>
                    <li style={styles.item}>
                        <span
                          style={styles.link}
                          onClick={() => setSelectedReport('production')}
                        >
                          Relatório de produção
                        </span>
                    </li>
                    {/* quando eu clico em relatorio de producao, por exemplo, o valor de selectedReport é alterado para production, como pode ser visto em onClick{()...*/}
                    <li style={styles.item}>
                      <span
                        style={styles.link}
                        onClick={() => setSelectedReport('technician')}
                        >
                        Relatório de produção mensal por técnico
                        </span>
                    </li>

                    <li style={styles.item}>
                      <span
                        style={styles.link}
                        onClick={() => setSelectedReport('stock')}
                      >
                        Relatório de consumo mensal
                      </span>
                    </li>
                    
                    <li style={styles.item}>
                      <span 
                        style={styles.link}
                        onClick={() => setSelectedReport('loans')}
                      >
                        Relatório de empréstimos de equipamentos
                      </span>
                    </li>
                </ul>
                </>
            )}

            {/* visualizacao individual do relatorio, o estado mudou, e o react re-renderiza o componente, exibindo o bloco de codigo embaixo */}
            {selectedReport !== null && (
              <div style={styles.reportContainer}>
                <button style={styles.backButton} onClick={() => setSelectedReport(null)}>
                  &larr; Voltar para o menu de relatórios
                </button>

                {selectedReport === 'production' && (
                  <div>
                    <h2>Relatório de produção</h2>
                    <p><em>(descricao)</em></p>
                  </div>
                )}

                {selectedReport === 'technician' && (
                  <div>
                    <h2>Relatório de produção mensal por técnico</h2>
                    <p><em>(descricao)</em></p>
                  </div>
                )}
                {/* isso é basicamente um atalho pra if (selectedReport === 'stock') { return (<div>...</div>);} */}
                {selectedReport === 'stock' && (
                  <div>
                    <h2>Relatório de consumo mensal de estoque</h2>
                    <p><em>(descricao)</em></p>
                  </div>
                )}

                {selectedReport === 'loans' && (
                  <div>
                    <h2>emprestimos equipamento</h2>
                    <p><em>(descricao)</em></p>
                  </div>
                )}
              </div>
            )}
        </div>
    );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  list: {
    listStyleType: 'none',
    padding: 0,
    marginTop: '25px',
  },
  item: {
    marginBottom: '18px',
  },
  link: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#2980b9',
    cursor: 'pointer',
    textDecoration: 'underline',
    display: 'inline-block',
  },
  reportContainer: {
    marginTop: '20px',
  },
  backButton: {
    padding: '6px 12px',
    backgroundColor: 'transparent',
    color: '#2980b9',
    border: '1px solid #2980b9',
    borderRadius: '4px',
    cursor: 'pointer',
    marginBottom: '20px',
    fontWeight: 'bold',
  },
};
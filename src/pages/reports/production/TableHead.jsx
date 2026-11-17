// cabecalho de tabela reutilizavel
import styles from './ProductionReport.module.css';

// Cabeçalho de tabela a partir de uma lista de nomes de coluna
export function TableHead({ columns }) {
    return (
        <thead>
            <tr className={styles.thRow}>
                {columns.map((column) => (
                    <th key={column} className={styles.th}>{column}</th>
                ))}
            </tr>
        </thead>
    );
}
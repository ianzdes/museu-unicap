// campos do formulário e modal. quando você clicar em nova produção
import { TYPE_PRINT, TYPE_SCAN } from './ProductionUtils';
import styles from './ProductionReport.module.css';

// Campos de uma produção. Usado no formulário de cadastro e no modal de edição.
//   values:            dados atuais do formulário
//   onChange:          recebe o objeto inteiro atualizado
//   machines:          lista de máquinas (tabela equipments)
//   technicianOptions: nomes já usados, para sugestão no campo "Técnico"
export function ProductionFields({ values, onChange, machines, technicianOptions }) {
    const set = (field, value) => onChange({ ...values, [field]: value });

    // Ao trocar o tipo, limpa a máquina; scanner normalmente não consome insumo
    const handleTypeChange = (value) => {
        onChange({
            ...values,
            production_type: value,
            equipment_name: '',
            supply_grams: value === TYPE_SCAN ? '0' : values.supply_grams,
        });
    };

    // Mostra as máquinas da categoria do tipo; se não houver nenhuma, mostra todas
    const machinesOfType = machines.filter((m) => m.category === values.production_type);
    const machineOptions = machinesOfType.length > 0 ? machinesOfType : machines;

    // Mantém visível a máquina de um registro antigo (renomeada ou excluída) ao editar
    const hasCurrentMachine = machineOptions.some((m) => m.name === values.equipment_name);

    return (
        <>
            <div className={styles.fieldGroup}>
                <label className={styles.label}>Tipo de Produção:</label>
                <select
                    value={values.production_type}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    className={styles.input}
                >
                    <option value={TYPE_PRINT}>Impressão 3D</option>
                    <option value={TYPE_SCAN}>Digitalização (Scanner)</option>
                </select>
            </div>

            <div className={styles.fieldGroup}>
                <label className={styles.label}>Descrição (o que foi impresso ou escaneado):</label>
                <textarea
                    value={values.description}
                    onChange={(e) => set('description', e.target.value)}
                    required
                    className={`${styles.input} ${styles.textarea}`}
                    placeholder="Ex: Réplica de busto em PLA, escala 1:2"
                />
            </div>

            <div className={styles.fieldGroup}>
                <label className={styles.label}>Técnico Responsável:</label>
                <input
                    type="text"
                    list="technician-options"
                    value={values.technician_name}
                    onChange={(e) => set('technician_name', e.target.value)}
                    required
                    className={styles.input}
                    placeholder="Ex: Maria Souza"
                />
                <datalist id="technician-options">
                    {technicianOptions.map((tech) => (
                        <option key={tech} value={tech} />
                    ))}
                </datalist>
            </div>

            <div className={styles.fieldGroup}>
                <label className={styles.label}>Cliente Atendido:</label>
                <input
                    type="text"
                    value={values.client_name}
                    onChange={(e) => set('client_name', e.target.value)}
                    required
                    className={styles.input}
                    placeholder="Ex: João Silva (Aluno)"
                />
            </div>

            <div className={styles.fieldGroup}>
                <label className={styles.label}>Máquina Utilizada:</label>
                <select
                    value={values.equipment_name}
                    onChange={(e) => set('equipment_name', e.target.value)}
                    required
                    className={styles.input}
                >
                    <option value="">Selecione a máquina</option>
                    {values.equipment_name && !hasCurrentMachine && (
                        <option value={values.equipment_name}>{values.equipment_name}</option>
                    )}
                    {machineOptions.map((m) => (
                        <option key={m.id} value={m.name}>{m.name}</option>
                    ))}
                </select>
            </div>

            <div className={styles.fieldGroup}>
                <label className={styles.label}>Data da Produção:</label>
                <input
                    type="date"
                    value={values.production_date}
                    onChange={(e) => set('production_date', e.target.value)}
                    required
                    className={styles.input}
                />
            </div>

            <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                    <label className={styles.label}>Insumo Usado (g):</label>
                    <input
                        type="number"
                        min="0"
                        step="1"
                        value={values.supply_grams}
                        onChange={(e) => set('supply_grams', e.target.value)}
                        className={styles.input}
                        placeholder="0"
                    />
                </div>

                <div className={styles.fieldGroup}>
                    <label className={styles.label}>Tempo (minutos):</label>
                    <input
                        type="number"
                        min="1"
                        step="1"
                        value={values.production_minutes}
                        onChange={(e) => set('production_minutes', e.target.value)}
                        required
                        className={styles.input}
                        placeholder="Ex: 150"
                    />
                </div>
            </div>

            <p className={styles.hint}>
                {values.production_type === TYPE_SCAN
                    ? 'Digitalizações normalmente não consomem insumo: deixe 0.'
                    : 'Informe 0 se a produção não consumiu insumo.'}
            </p>
        </>
    );
}
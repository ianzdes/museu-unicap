import { MachineRegister } from "../components/MachineRegister";

export function MachinesPage() {
    return (
        <div>
            <h1>Acompanhamento de máquinas</h1>
            <p>Registrar e acompanhar impressoras e scanners 3D disponíveis no museu.</p>
            <MachineRegister />
        </div>
    );
}
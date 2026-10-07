import { MachineRegister } from "../components/MachineRegister";

export function MachinesPage() {
    return (
        <div>
            <h1>Machine management</h1>
            <p>Register and track 3d printers and scanner available in the museum</p>
            <MachineRegister />
        </div>
    );
}
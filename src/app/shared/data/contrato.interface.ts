import { Sessao } from "../../features/sessao/sessao";
import { Disciplina } from "./disciplina.interface";
import { Paciente } from "./paciente.interface";
import { PlanoSaude } from "./planosaude.interface";
import { SessaoIdEnum } from "./sessao-id.enum";

export interface Contrato {
    id: number;
    DateeffetiveDate: Date | string ;
    dateOfValidity: Date | string;
    carePlan: PlanoSaude;
    //healthInsurance: PlanoSaude;
    patient: Paciente;
    disciplineAnamneseDTO: Disciplina[];
    sessionsId: SessaoIdEnum[];
    observation: string;
    status: boolean;
}
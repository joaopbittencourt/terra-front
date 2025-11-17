import { Contrato } from "./contrato.interface";
import { Disciplina } from "./disciplina.interface";
import { SessaoIdEnum } from "./sessao-id.enum";

export interface Agendamento {
     
    id: number;
    sessionIdEnum: SessaoIdEnum;
    disciplina: Disciplina;
    contrato: Contrato;
    data: Date | string;
}
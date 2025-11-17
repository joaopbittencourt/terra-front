import { Contrato } from './contrato.interface';
import { Disciplina } from './disciplina.interface';
import { Equipe } from './equipe.interface';
import { SessaoIdEnum } from './sessao-id.enum';

export interface Sessao {
    id?: string;                    // UUID in TypeScript is represented as string
    data: Date | string;           // Date can be either Date object or ISO string
    contrato: Contrato;           // ManyToOne relationship
    sessaoId: SessaoIdEnum;       // Enum type
    equipe: Equipe;               // ManyToOne relationship
    disciplina: Disciplina;       // ManyToOne relationship
    exec?: string;                // Optional execution notes
    status: boolean;              // Boolean status
    criadoEm?: Date | string;     // Optional creation date
    atualizadoEm?: Date | string; // Optional update date
}
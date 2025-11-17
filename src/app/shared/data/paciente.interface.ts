import { Endereco } from './endereco.interface';
import { Responsavel } from './responsavel.interface';

export interface Paciente {
    id?: string;
    primeiroNome: string;
    sobrenome?: string;
    nomeCompleto?: string;
    email?: string;
    dataNascimento?: string | Date;
    telefone?: string;
    genero?: 'masculino' | 'feminino' | 'outro' | 'nao_informado';
    cpf?: string;
    rg?: string;
    ativo?: boolean;
    endereco?: Endereco;
    convenio?: string;
    numeroProntuario?: string;
    alturaCm?: number;
    pesoKg?: number;
    alergias?: string[];
    historicoMedico?: string[];
    responsavel?: Responsavel[];
    criadoEm?: string | Date;
    atualizadoEm?: string | Date;
    observacoes?: string;
}
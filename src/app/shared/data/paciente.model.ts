import { Endereco } from './endereco.interface';
import { Paciente } from './paciente.interface';
import { Responsavel } from './responsavel.interface';

export class PacienteModel implements Paciente {
    id?: string;
    primeiroNome!: string;
    sobrenome?: string;
    nomeCompleto?: string;
    email?: string;
    dataNascimento?: string | Date;
    telefone?: string;
    genero?: 'masculino' | 'feminino' | 'outro' | 'nao_informado';
    cpf?: string;
    rg?: string;
    ativo: boolean = true;
    endereco?: Endereco;
    convenio?: string;
    numeroProntuario?: string;
    alturaCm?: number;
    pesoKg?: number;
    alergias: string[] = [];
    historicoMedico: string[] = [];
    responsavel?: Responsavel[] = [];
    criadoEm?: string | Date;
    atualizadoEm?: string | Date;
    observacoes?: string;

    constructor(data: Partial<Paciente>) {
        Object.assign(this, data);
        this.nomeCompleto = this.nomeCompleto ?? this.calcNomeCompleto();
        this.criadoEm = this.criadoEm ?? new Date().toISOString();
        if (typeof this.ativo === 'undefined') this.ativo = true;
    }

    private calcNomeCompleto(): string {
        return [this.primeiroNome, this.sobrenome].filter(Boolean).join(' ');
    }

    get idade(): number | null {
        if (!this.dataNascimento) return null;
        const d = typeof this.dataNascimento === 'string' ? new Date(this.dataNascimento) : this.dataNascimento;
        if (isNaN(d.getTime())) return null;
        const diff = Date.now() - d.getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    }

    toJSON(): Paciente {
        return {
            id: this.id,
            primeiroNome: this.primeiroNome,
            sobrenome: this.sobrenome,
            nomeCompleto: this.nomeCompleto,
            email: this.email,
            dataNascimento: this.dataNascimento instanceof Date ? this.dataNascimento.toISOString() : this.dataNascimento,
            telefone: this.telefone,
            genero: this.genero,
            cpf: this.cpf,
            rg: this.rg,
            ativo: this.ativo,
            endereco: this.endereco,
            convenio: this.convenio,
            numeroProntuario: this.numeroProntuario,
            alturaCm: this.alturaCm,
            pesoKg: this.pesoKg,
            alergias: this.alergias,
            historicoMedico: this.historicoMedico,
            responsavel: this.responsavel,
            criadoEm: this.criadoEm instanceof Date ? this.criadoEm.toISOString() : this.criadoEm,
            atualizadoEm: this.atualizadoEm instanceof Date ? this.atualizadoEm.toISOString() : this.atualizadoEm,
            observacoes: this.observacoes,
        };
    }

    static fromJSON(json: Partial<Paciente>): PacienteModel {
        const data: Partial<Paciente> = { ...json };
        if (data.dataNascimento && typeof data.dataNascimento === 'string') {
            // keep as string (ISO) or convert if you prefer Date
        }
        return new PacienteModel(data);
    }

    validar(): string[] {
        const erros: string[] = [];
        if (!this.primeiroNome || !this.primeiroNome.trim()) erros.push('primeiroNome é obrigatório');
        if (this.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) erros.push('email inválido');
        if (this.cpf && !/^\d{11}$/.test(this.cpf.replace(/\D/g, ''))) erros.push('cpf deve conter 11 dígitos numéricos');
        return erros;
    }
}
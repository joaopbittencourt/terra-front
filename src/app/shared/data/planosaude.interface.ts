export type TipoPlano = 'Individual' | 'Familiar' | 'Empresarial' | 'Individual+Odonto';
export type Acomodacao = 'Apartamento' | 'Enfermaria' | 'Ambos';

export interface PlanoSaude {
    id: string;
    nome: string;
    operadora: string;
}
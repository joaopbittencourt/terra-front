import { Modality } from './modality.interface';

export interface TherapyValue {
    modality?: Modality | string;
    value: number;
}

export interface Therapy {
    id?: string;
    name: string;
    description?: string;
    values?: TherapyValue[];
    active?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}
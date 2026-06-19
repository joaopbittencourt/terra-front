import { Therapy } from './therapy.interface';

export interface ServicePackage {
    id?: string;
    name: string;
    therapy: Therapy;
    qtdSessions: number;
    price: number;
    description?: string;
    active?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

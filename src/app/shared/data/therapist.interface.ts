export interface Therapist {
    id?: string;
    name: string;
    username: string;
    email: string;
    cpf: string;
    phoneNumber?: string;
    professionalRegistration?: string; // Professional registration number
    therapies?: string[]; // IDs of therapies this therapist offers
    sessionsId?: SessionIdEnum[];
    contractType?: 'percentage' | 'fixed';
    percentage?: number | null;
    remuneration?: number | null;
    active?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}
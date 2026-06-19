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
    active?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}
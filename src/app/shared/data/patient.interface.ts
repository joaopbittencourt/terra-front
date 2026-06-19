import { Address } from './address.interface';
import { Guardian } from './guardian.interface';

export interface Patient {
    id?: string;
    firstName: string;
    lastName?: string;
    email?: string;
    birthDate?: string | Date;
    phoneNumber?: string;
    gender?: 'male' | 'female' | 'other' | 'not_informed';
    document?: string;
    document2?: string;
    status?: boolean;
    address?: Address;
    healthPlan?: string;
    allergies?: string[];
    medicalHistory?: string[];
    guardians?: Guardian[];
    createdAt?: string | Date;
    updatedAt?: string | Date;
    observations?: string;
}
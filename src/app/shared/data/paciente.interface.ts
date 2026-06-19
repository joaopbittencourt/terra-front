import { Address } from './address.interface';
import { Guardian } from './guardian.interface';
import { ServicePackage } from './service-package.interface';

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
    servicePackage?:ServicePackage;
    allergies?: string[];
    medicalHistory?: string[];
    guardians?: Guardian[];
    createdAt?: string | Date;
    updatedAt?: string | Date;
    observations?: string;
}
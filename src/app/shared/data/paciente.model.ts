import { Address } from './address.interface';
import { Patient } from './patient.interface';
import { Guardian } from './guardian.interface';

export class PatientModel implements Patient {
    id?: string;
    firstName!: string;
    lastName?: string;
    email?: string;
    birthDate?: string | Date;
    phoneNumber?: string;
    gender?: 'male' | 'female' | 'other' | 'not_informed';
    document?: string;
    document2?: string;
    status: boolean = true;
    address?: Address;
    healthPlan?: string;
    allergies: string[] = [];
    medicalHistory: string[] = [];
    guardians?: Guardian[] = [];
    createdAt?: string | Date;
    updatedAt?: string | Date;
    observations?: string;

    constructor(data: Partial<Patient>) {
        Object.assign(this, data);
        this.createdAt = this.createdAt ?? new Date().toISOString();
        if (typeof this.status === 'undefined') this.status = true;
    }

    get age(): number | null {
        if (!this.birthDate) return null;
        const d = typeof this.birthDate === 'string' ? new Date(this.birthDate) : this.birthDate;
        if (isNaN(d.getTime())) return null;
        const diff = Date.now() - d.getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    }

    toJSON(): Patient {
        return {
            id: this.id,
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            birthDate: this.birthDate instanceof Date ? this.birthDate.toISOString() : this.birthDate,
            phoneNumber: this.phoneNumber,
            gender: this.gender,
            document: this.document,
            document2: this.document2,
            status: this.status,
            address: this.address,
            healthPlan: this.healthPlan,
            allergies: this.allergies,
            medicalHistory: this.medicalHistory,
            guardians: this.guardians,
            createdAt: this.createdAt instanceof Date ? this.createdAt.toISOString() : this.createdAt,
            updatedAt: this.updatedAt instanceof Date ? this.updatedAt.toISOString() : this.updatedAt,
            observations: this.observations,
        };
    }

    static fromJSON(json: Partial<Patient>): PatientModel {
        const data: Partial<Patient> = { ...json };
        if (data.birthDate && typeof data.birthDate === 'string') {
            // keep as string (ISO) or convert if you prefer Date
        }
        return new PatientModel(data);
    }

    validate(): string[] {
        const errors: string[] = [];
        if (!this.firstName || !this.firstName.trim()) errors.push('firstName is required');
        if (this.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) errors.push('email is invalid');
        if (this.document && !/^\d{11}$/.test(this.document.replace(/\D/g, ''))) errors.push('document must contain 11 numeric digits');
        return errors;
    }
}
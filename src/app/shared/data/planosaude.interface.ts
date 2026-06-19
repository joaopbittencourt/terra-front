export type PlanType = 'Individual' | 'Family' | 'Corporate' | 'Individual+Dental';
export type Accommodation = 'Private' | 'Ward' | 'Both';

export interface HealthPlan {
    id: string;
    name: string;
    signatureDate: string; // ISO date
    expiryDate: string;   // ISO date
    status: boolean;
    registrationNumber: string;
}
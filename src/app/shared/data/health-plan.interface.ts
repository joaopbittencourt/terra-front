export type PlanType = 'Individual' | 'Family' | 'Corporate' | 'Individual+Dental';
export type Accommodation = 'Private' | 'Ward' | 'Both';

export interface healthInsurance {
    id: string;
    name: string;
    effetiveDate: string; // ISO date
    dateOfValidity: string;   // ISO date
    status: boolean;
    registrationNumber: string;
    operatorCod: string;
    productCod: string;
}
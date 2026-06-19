
import { Discipline } from "./discipline.interface";
import { Patient } from "./patient.interface";
import { healthInsurance } from "./health-plan.interface";
import { SessionIdEnum } from "./session-id.enum";
import { Modality } from "./modality.interface";


export interface Contract {
    id: number;
    effectiveDate: Date | string ;
    expiryDate: Date | string;
    carePlan: any;
    healthInsurance?: healthInsurance;
    patient: Patient;
    modality: Modality;
    sessionsId: SessionIdEnum[];
    observation: string;
    status: boolean;
}
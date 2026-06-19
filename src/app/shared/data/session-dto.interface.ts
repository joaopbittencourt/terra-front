import { Therapy } from "./terapia.interface";
import { Therapist } from "./therapist.interface";

    
export interface SessionDTO { 

    id?: string;              // UUID in TypeScript is represented as string
    sessionIdEnum: SessionIdEnum; // Enum type
    date: Date | string;     // Date can be either Date object or ISO string
    therapist: Therapist;     // ManyToOne relationship
    therapy: Therapy;         // ManyToOne relationship
    description?: string;     // Optional description
    status: boolean;          // Boolean status
    createdAt?: Date ;// Optional creation date
    updatedAt?: Date ; // Optional update date
   }
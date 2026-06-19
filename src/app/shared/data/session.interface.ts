import { Contract } from './contract.interface';
import { Discipline } from './discipline.interface';
import { Team } from './team.interface';
import { SessionIdEnum } from './session-id.enum';
import { Therapy } from './therapy.interface';
import { Therapist } from './therapist.interface';

export interface Session {
    id?: string;                    // UUID in TypeScript is represented as string
    date: Date | string;           // Date can be either Date object or ISO string
    contract: Contract;           // ManyToOne relationship
    sessionId: SessionIdEnum;       // Enum type
    therapist: Therapist;               // ManyToOne relationship
    therapy: Therapy;       // ManyToOne relationship
    execution?: string;                // Optional execution notes
    description?: string;              // Optional description
    status: boolean;              // Boolean status
    createdAt?: Date | string;     // Optional creation date
    updatedAt?: Date | string; // Optional update date
}
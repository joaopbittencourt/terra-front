import { Contract } from './contract.interface';
import { Discipline } from './discipline.interface';
import { Team } from './team.interface';
import { SessionIdEnum } from './session-id.enum';
import { Session } from './session.interface';

export interface Schedule {
    id?: string;                    // UUID in TypeScript is represented as string
    date: Date | string;           // Date can be either Date object or ISO string
    contract: Contract;            // ManyToOne relationship
    sessionIdEnum: SessionIdEnum;  
    sessionList: Session[];        // List of sessions
    team: Team;                    // ManyToOne relationship (therapist)
    discipline: Discipline;        // ManyToOne relationship
    status: boolean;               // Boolean status (true = scheduled, false = cancelled)
    createdAt?: Date | string;     // Optional creation date
    updatedAt?: Date | string;     // Optional update date
}

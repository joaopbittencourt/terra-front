import { Contract } from "./contract.interface";
import { Discipline } from "./discipline.interface";
import { SessionIdEnum } from "./session-id.enum";

export interface Appointment {
     
    id: number;
    sessionIdEnum: SessionIdEnum;
    discipline: Discipline;
    contract: Contract;
    date: Date | string;
}
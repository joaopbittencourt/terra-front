import { MovementOutput } from "./movement-output.model";
import { Session } from "./session.interface";
import { Team } from "./team.interface";

export class TherapistMonthlyClosing{
    id?: string;
    value!: number;
    description!: any;
    sessionList?: Session[];
    therapist?: Team;
    movementOutput!: MovementOutput[];
    user?: string;
    initialPeriod!: Date;
    finalPeriod!: Date;
    createdAt!: Date;
    updatedAt?: Date;
    finalizedAt?: Date;

}
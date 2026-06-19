import { Therapy } from "./terapia.interface";
import { Therapist } from "./therapist.interface";

    
export interface ScheduleDTO { 

    sessionIdEnumList: SessionIdEnum[];
    therapistId: string;
    therapyId: string;
   }
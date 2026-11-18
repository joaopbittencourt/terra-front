import { BankAccount } from "./bankaccount.model";
import { Contract } from "./contract.interface";
import { TherapistMonthlyClosing } from "./therapist-monthly-closing.model";

export interface PaymentDTO {
    id?: string;
    value: number;
    description: any;
    paymentMethodEnum: PaymentMethodEnum;
    categoryPaymentEnum: CategoryPaymentEnum;
    therapistMonthlyClosing: TherapistMonthlyClosing;
    bankAccount?: BankAccount;
    contract?: Contract;
    user?: string;
  
}
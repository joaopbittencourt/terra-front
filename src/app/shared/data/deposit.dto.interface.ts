import { BankAccount } from "./bankaccount.model";
import { Contract } from "./contract.interface";
import { healthInsurance } from "./health-plan.interface";

export interface DepositDTO {
    id?: string;
    value: number;
    description: any;
    paymentMethodEnum: PaymentMethodEnum;
    categoryRecibimentEnum: CategoryRecebimentEnum;
    healthInsurance?: healthInsurance;
    bankAccount?: BankAccount;
    contract?: Contract;
    user?: string;
  
}
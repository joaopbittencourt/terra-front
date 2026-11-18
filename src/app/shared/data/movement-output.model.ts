import { BankAccount } from "./bankaccount.model";
import { Contract } from "./contract.interface";
import { FinancialFlow } from "./financialflow.model";

export class MovementOutput extends FinancialFlow {
    id!: number;
    contract!: Contract;
    categoryPaymentEnum!: CategoryPaymentEnum;
}

import { BankAccount } from "./bankaccount.model";

export class FinancialFlow {
    value!: number;
    description!: string;
    bankAccount!: BankAccount;
    paymentMethodEnum!: PaymentMethodEnum;
    user!: string;
    createdAt!: Date;
    updatedAt!: Date;
}

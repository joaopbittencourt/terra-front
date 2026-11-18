import { BankAccount } from "./bankaccount.model";
import { Contract } from "./contract.interface";
import { FinancialFlow } from "./financialflow.model";
import { healthInsurance } from "./health-plan.interface";

export class MovementInput extends FinancialFlow {
	id!: number;
	contract!: Contract;
	categoryRecibimentEnum!: CategoryRecebimentEnum;
	healthInsurance!: healthInsurance;
}

import { validators, type SchemaRules } from "@/shared/validation";
import type {
  LoanDetailsFormData,
  LoanBusinessFormData,
  LoanBankingFormData,
} from "../types/loans.types";

/** Working Capital Loan details validation schema */
export const workingCapitalDetailsSchema: SchemaRules<LoanDetailsFormData> = {
  requiredAmount: validators.amount("Required Loan Amount", { min: 10000 }),
  purpose: validators.required("Purpose of Loan"),
  preferredTenureMonths: validators.tenure(),
  employmentType: validators.required("Facility Type"),
};

/** Machinery Loan details validation schema */
export const machineryLoanDetailsSchema: SchemaRules<LoanDetailsFormData> = {
  requiredAmount: validators.amount("Required Loan Amount", { min: 10000 }),
  purpose: validators.required("Machinery / Equipment Type"),
  preferredTenureMonths: validators.tenure(),
};

/** Business details schema shared across loans */
export const loanBusinessSchema: SchemaRules<LoanBusinessFormData> = {
  businessName: validators.requiredText("Business Name", { minLength: 2 }),
  businessVintageYears: validators.required("Business Vintage"),
  annualTurnover: validators.amount("Annual Turnover", { min: 1 }),
};

/** Banking details schema shared across Working Capital, Machinery Loan, Project Finance */
export const loanBankingSchema: SchemaRules<LoanBankingFormData> = {
  primaryBankName: validators.requiredText("Bank Name", { minLength: 2 }),
  accountNumber: validators.requiredText("Account Number", { minLength: 9, maxLength: 18 }),
  ifscCode: validators.ifsc("IFSC Code"),
};

export default {
  workingCapitalDetailsSchema,
  machineryLoanDetailsSchema,
  loanBusinessSchema,
  loanBankingSchema,
};

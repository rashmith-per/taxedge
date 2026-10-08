import type {
  LoanBankingStepConfig,
  LoanEmploymentStepConfig,
  LoanDocumentCategoryConfig,
} from "../../components/steps";

export const HOME_LOAN_BANKING_STEP: LoanBankingStepConfig = {
  primaryAccountTitle: "Primary Operating & Disbursement Bank",
  primaryAccountDescription:
    "Specify the account for loan disbursement and setting up auto-debit EMI repayments.",
  existingLoansDescription: "Disclose running lender and remaining balance for eligibility computation.",
};

export const HOME_LOAN_EMPLOYMENT_STEP: LoanEmploymentStepConfig = {
  incomeCardTitle: "Monthly Household Income",
  incomeCardDescription: "Select monthly household income range or enter your exact net income.",
  customIncomePlaceholder: "Enter monthly net income (₹) (e.g. 50000)",
  businessCardDescription: "Provide enterprise details per Section 10 of loan underwriting requirements.",
  hasExistingLoansLabel: "Yes, Paying EMIs",
  existingEmiPlaceholder: "Enter total monthly EMI amount (₹)",
  incomeModalTitle: "Select Monthly Household Income",
};

export const HOME_LOAN_DOCUMENT_CATEGORIES: readonly LoanDocumentCategoryConfig[] = [
  { name: "Identity & Address", icon: "person-circle-outline" },
  { name: "Income & Banking", icon: "wallet-outline" },
  { name: "Property & Collateral", icon: "home-outline" },
];

import type {
  LoanBankingStepConfig,
  LoanEmploymentStepConfig,
  LoanDocumentCategoryConfig,
} from "../../components/steps";

export const VEHICLE_LOAN_BANKING_STEP: LoanBankingStepConfig = {
  primaryAccountTitle: "Primary Operating & Repayment Bank",
  primaryAccountDescription:
    "Specify the account for loan disbursement and setting up auto-debit NACH EMI repayments.",
  existingLoansDescription: "Disclose running lender and remaining balance for auto-loan credit assessment.",
  styleOverrides: {
    helperText: { color: "#94A3B8" },
    statusChip: { justifyContent: "center" },
  },
};

export const VEHICLE_LOAN_EMPLOYMENT_STEP: LoanEmploymentStepConfig = {
  incomeCardTitle: "Monthly In-Hand Income",
  incomeCardDescription: "Select monthly take-home income range or specify your exact net income.",
  customIncomePlaceholder: "Enter monthly net income (₹) (e.g. 45000)",
  businessCardDescription: "Provide enterprise details for commercial/auto-credit underwriting.",
  hasExistingLoansLabel: "Yes, Active EMIs",
  existingEmiPlaceholder: "Enter total ongoing monthly EMI (₹)",
  incomeModalTitle: "Select Monthly In-Hand Income",
};

export const VEHICLE_LOAN_DOCUMENT_CATEGORIES: readonly LoanDocumentCategoryConfig[] = [
  { name: "Identity & Address", icon: "person-circle-outline" },
  { name: "Income & Banking", icon: "wallet-outline" },
  { name: "Collateral & Others", icon: "car-outline", label: "Vehicle Quotation & Collateral" },
];

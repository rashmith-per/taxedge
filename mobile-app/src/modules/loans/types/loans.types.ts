import { ServiceCardData } from "../../../shared/components/ServiceCard";

export type LoanType =
  | "Business Loan"
  | "Personal Loan"
  | "Home Loan"
  | "Property Loan"
  | "Vehicle Loan"
  | "Working Capital"
  | "Machinery Loan"
  | "Project Finance"
  | "MSME Loan";

export type LoanTypeId =
  | "business-loan"
  | "personal-loan"
  | "home-loan"
  | "property-loan"
  | "vehicle-loan"
  | "working-capital"
  | "machinery-loan"
  | "project-finance"
  | "msme-loan";

export type LoanEmploymentType =
  | "Salaried"
  | "Self-Employed Professional"
  | "Business Owner";

export type LoanApplicationStatus =
  | "New Lead"
  | "Application Received"
  | "Documents Pending"
  | "Documents Received"
  | "Eligibility Verification"
  | "Application Prepared"
  | "Submitted to Lender"
  | "Under Credit Review"
  | "Query Raised"
  | "Query Resolved"
  | "Sanctioned"
  | "Sanction Letter"
  | "Documentation"
  | "Disbursement"
  | "Completed"
  | "Rejected"
  | "On Hold";

export interface LoanServiceItem extends ServiceCardData {
  loanTypeKey?: LoanTypeId;
  minAmount?: number;
  maxAmount?: number;
  interestRateText?: string;
  maxTenureYears?: number;
}

export interface CustomerProfileSummary {
  name: string;
  mobile: string;
  email: string;
  pan: string;
  aadhaar: string;
  dob: string;
  address: string;
  customerType: string;
}

export interface LoanDetailsFormData {
  loanType: LoanType | string;
  requiredAmount: string;
  purpose: string;
  customPurpose?: string;
  propertyStage?:
    | "Ready to Move"
    | "Under Construction"
    | "Resale Property"
    | "Plot + Construction"
    | "Self Construction";
  estimatedPropertyValue?: string;
  propertyCity?: string;
  preferredTenureMonths: string;
  hasExistingLoans?: boolean;
  existingEmi: string;
  monthlyIncomeOrTurnover: string;
  employmentType?: LoanEmploymentType;
  equipmentType?: string;
  customEquipmentType?: string;
}

export interface ExistingLoanDetail {
  lenderName: string;
  sanctionedAmount: string;
  currentOutstanding: string;
  monthlyEmi: string;
  loanType: string;
}

export interface LoanApplicantFormData {
  fullName: string;
  pan: string;
  mobile: string;
  dob: string;
  currentAddress: string;
  gender: string;
  maritalStatus: string;
  residenceType: string;
  yearsAtCurrentAddress: string;
  employerCategory: string;
  employerName: string;
  totalWorkExperience: string;
  yearsInCurrentJob: string;
  annualIncome: string;
  hasExistingLoans: any;
}

export interface LoanPropertyFormData {
  pincode: string;
  city: string;
  district: string;
  state: string;
  propertyAddress: string;
  landmark: string;
  propertyType: string;
  propertySubType: string;
  constructionStatus: string;
  currentUsage: string;
  areaType: string;
  area: string;
  propertyAge: string;
  approvingAuthority: string;
  estimatedMarketValue: string;
  ownershipType?: string;
}

export interface LoanOwnershipFormData {
  ownershipType: string;
  coOwnerFullName: string;
  coOwnerRelationship: string;
  coOwnerPan: string;
  coOwnerMobile: string;
  currentLender: string;
  existingLoanType: string;
  outstandingLoanAmount: string;
  isConfirmationChecked: boolean;
}

export interface LoanBusinessFormData {
  businessName: string;
  businessType?: string;
  otherBusinessType?: string;
  isGstRegistered?: boolean;
  businessConstitution?: string;
  hasUdyam?: boolean;
  gstin: string;
  udyamRegistration?: string;
  businessVintageYears: string;
  annualTurnover: string;
  netProfit: string;
  signatoryName?: string;
  signatoryDesignation?: string;
  signatoryEmail?: string;
}

export interface LoanBankingFormData {
  primaryBankName: string;
  accountNumber: string;
  confirmAccountNumber?: string;
  ifscCode: string;
  branchName?: string;
  isIfscVerified?: boolean;
  existingLenderName?: string;
  existingLoanOutstanding?: string;
  itrFilingStatus?: "Filed" | "Not Filed" | "Exempt";
  itrAckNumber?: string;
  grossTotalIncome?: string;
}

export type LoanDocumentCategory =
  | "Identity & Address"
  | "Income & Banking"
  | "Business & Tax"
  | "Collateral & Others"
  | "Property & Collateral";

export interface LoanDocumentItem {
  id: string;
  name: string;
  subtitle: string;
  required: boolean;
  iconName: string;
  iconBg: string;
  iconColor: string;
  category: LoanDocumentCategory;
  fileUri?: string;
  fileName?: string;
  fileSize?: string;
  uploadedAt?: string;
}

export interface LoanApplicationDraft {
  id: string;
  stepIndex: number;
  loanType: LoanType | string;
  loanTypeId: LoanTypeId;
  customerProfile: Partial<CustomerProfileSummary>;
  loanDetails: LoanDetailsFormData;
  applicantDetails?: LoanApplicantFormData;
  propertyDetails?: LoanPropertyFormData;
  ownershipDetails?: LoanOwnershipFormData;
  businessDetails?: LoanBusinessFormData;
  bankingDetails: LoanBankingFormData;
  documents: LoanDocumentItem[];
  status: LoanApplicationStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoanApplicationResponse {
  applicationId: string;
  referenceNumber: string;
  loanType: string;
  status: LoanApplicationStatus;
  amount: number;
  equipmentType?: string;
  tenureMonths?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  businessName?: string;
  applicantName?: string;
  createdAt: string;
  timeline: {
    status: LoanApplicationStatus;
    title: string;
    description: string;
    timestamp: string;
    completed: boolean;
    isCurrent: boolean;
  }[];
}

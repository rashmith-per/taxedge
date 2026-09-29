// Step 7: Documents, Review & Submit Data Constants

export interface DocumentUploadItem {
  id: string;
  name: string;
  category: "All Documents" | "Applicant" | "Project" | "Financial" | "Legal" | "Others";
  formatInfo: string;
  isRequired: boolean;
  iconName: string;
  uploadedFileName?: string;
  uploadedFileSize?: string;
  uploadedFileUri?: string;
  uploadedAt?: string;
}

export const DOCUMENT_CATEGORIES = [
  "All Documents",
  "Applicant",
  "Project",
  "Financial",
  "Legal",
  "Others",
] as const;

export const INITIAL_DOCUMENTS: DocumentUploadItem[] = [
  {
    id: "doc_1",
    name: "Identity Proof (Aadhaar / PAN)",
    category: "Applicant",
    formatInfo: "PDF, JPG, PNG (Max 5 MB)",
    isRequired: true,
    iconName: "person-outline",
  },
  {
    id: "doc_2",
    name: "Business Registration Certificate",
    category: "Applicant",
    formatInfo: "PDF, JPG, PNG (Max 5 MB)",
    isRequired: true,
    iconName: "business-outline",
  },
  {
    id: "doc_3",
    name: "Project Detailed Report (DPR)",
    category: "Project",
    formatInfo: "PDF, JPG, PNG (Max 5 MB)",
    isRequired: true,
    iconName: "document-text-outline",
  },
  {
    id: "doc_4",
    name: "Project Cost Estimate / Quotation",
    category: "Financial",
    formatInfo: "PDF, JPG, PNG (Max 5 MB)",
    isRequired: true,
    iconName: "bar-chart-outline",
  },
  {
    id: "doc_5",
    name: "Financial Statements (Last 3 Years)",
    category: "Financial",
    formatInfo: "PDF, JPG, PNG (Max 5 MB)",
    isRequired: false,
    iconName: "cash-outline",
  },
  {
    id: "doc_6",
    name: "Land / Property Documents (if applicable)",
    category: "Legal",
    formatInfo: "PDF, JPG, PNG (Max 5 MB)",
    isRequired: false,
    iconName: "document-attach-outline",
  },
  {
    id: "doc_7",
    name: "Other Supporting Documents",
    category: "Others",
    formatInfo: "PDF, JPG, PNG (Max 5 MB)",
    isRequired: false,
    iconName: "attach-outline",
  },
];

export const REVIEW_STEP_ITEMS = [
  { stepIndex: 0, title: "Applicant & Project", icon: "person-outline" },
  { stepIndex: 1, title: "Location, Land & Technical", icon: "location-outline" },
  { stepIndex: 2, title: "Project Cost & Funding", icon: "cube-outline" },
  { stepIndex: 3, title: "Market & Financials", icon: "bar-chart-outline" },
  { stepIndex: 4, title: "Loan Requirement & Repayment", icon: "calendar-outline" },
  { stepIndex: 5, title: "Security & Compliance", icon: "shield-checkmark-outline" },
  { stepIndex: 6, title: "Documents", icon: "document-text-outline" },
];

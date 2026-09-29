// Step 6: Security & Compliance Data Constants

export const SECURITY_TYPES = [
  "Mortgage on Project Land & Building",
  "Hypothecation of Plant & Machinery",
  "Charge on Current Assets / Book Debts",
  "Pledge of Promoter Shares",
  "Corporate Guarantee",
  "Personal Guarantee of Promoters",
  "Fixed Deposit Lien",
];

export const OWNERSHIP_TYPES = [
  "Freehold (Company Owned)",
  "Leasehold (Govt / Industrial Area)",
  "Promoter Owned (Mortgaged)",
  "Third Party Corporate Property",
];

export const BUSINESS_REGISTRATION_TYPES = [
  "Private Limited Company (CIN)",
  "Public Limited Company",
  "Limited Liability Partnership (LLP)",
  "Partnership Firm",
  "Sole Proprietorship",
  "Trust / Society",
];

export const INSURANCE_TYPES = [
  "Erection All Risks (EAR)",
  "Standard Fire and Special Perils (SFSP)",
  "Contractor's All Risk (CAR)",
  "Business Interruption / Loss of Profit",
  "Marine Cargo Insurance",
  "Comprehensive General Liability",
];

export const INITIAL_SECURITIES = [
  {
    id: "sec_1",
    typeOfSecurity: "",
    assetDescription: "",
    estimatedValue: "",
    ownershipType: "",
    locationOfAsset: "",
    valuationReportAvailable: true,
    anyExistingCharge: false,
    existingChargeDetails: "",
  },
];

export const INITIAL_LEGAL_APPROVALS = {
  environmentalClearance: true,
  buildingPlanApproval: true,
  factoryLicense: false,
  pollutionControlBoard: false,
  landUseConversion: false,
  powerConnectionApproval: false,
  waterSupplyApproval: false,
  otherApproval: false,
  otherApprovalDetails: "",
};

export const INITIAL_REGULATORY_COMPLIANCE = {
  businessRegistrationType: "",
  registrationNumber: "",
  gstApplicable: true,
  gstNumber: "",
  panNumber: "",
  tanNumber: "",
};

export const INITIAL_INSURANCE_DETAILS = {
  typeOfInsurance: "",
  coverageAmount: "",
  policyValidity: "",
};

export const INITIAL_OTHER_COMPLIANCE = {
  labourLawCompliance: true,
  localAuthorityApprovals: true,
  healthSafetyCompliance: true,
  industrySpecificCompliance: true,
  pendingLitigation: false,
  litigationDetails: "",
};


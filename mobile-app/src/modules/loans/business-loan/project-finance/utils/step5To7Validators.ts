import {
  LoanRequirementForm,
  RepaymentDetailsForm,
  RepaymentSourcesForm,
  SecurityCollateralItem,
  RegulatoryComplianceForm,
} from "../types/projectFinance.types";
import { DocumentUploadItem } from "../data/step7Data";

export interface Step5ValidationState {
  loanRequirement: LoanRequirementForm;
  repaymentDetails: RepaymentDetailsForm;
  repaymentSources: RepaymentSourcesForm;
  totalProjectCostFromScreen3?: string;
  ownContributionFromScreen3?: string;
}

export interface Step6ValidationState {
  securities: SecurityCollateralItem[];
  regulatoryCompliance: RegulatoryComplianceForm;
}

export interface Step7ValidationState {
  documents: DocumentUploadItem[];
  agreeAccuracy: boolean;
  agreeVerification: boolean;
}

export const validateStep5 = (state: Step5ValidationState): string | null => {
  const { loanRequirement, repaymentDetails, repaymentSources } = state;

  // 1. Loan Requirement
  if (!loanRequirement.loanRequired?.trim()) {
    return "Please enter Loan Required amount.";
  }
  if (!loanRequirement.typeOfLoan?.trim()) {
    return "Please select Type of Loan.";
  }
  if (!loanRequirement.schemeProduct?.trim()) {
    return "Please select Scheme / Product.";
  }
  if (!loanRequirement.proposedDisbursementDate?.trim()) {
    return "Please select Proposed Disbursement Date.";
  }

  // 2. Repayment Details
  if (!repaymentDetails.repaymentPeriodYears?.trim()) {
    return "Please select Repayment Period (Years).";
  }
  if (!repaymentDetails.repaymentFrequency?.trim()) {
    return "Please select Repayment Frequency.";
  }
  if (!repaymentDetails.expectedInterestRate?.trim()) {
    return "Please enter Expected Interest Rate (%).";
  }
  if (!repaymentDetails.repaymentStartDate?.trim()) {
    return "Please select Repayment Start Date.";
  }

  // 3. Repayment Sources
  if (!repaymentSources.primarySource?.trim()) {
    return "Please select Primary Source of Repayment.";
  }
  if (!repaymentSources.projectedDscr?.trim()) {
    return "Please enter Projected DSCR.";
  }
  if (!repaymentSources.explanation?.trim()) {
    return "Please provide Explanation of Repayment Sources.";
  }

  return null;
};

export const validateStep6 = (state: Step6ValidationState): string | null => {
  const { securities, regulatoryCompliance } = state;

  // 1. Security / Collateral
  if (!securities || securities.length === 0) {
    return "Please add at least one Security / Collateral asset.";
  }
  for (let i = 0; i < securities.length; i++) {
    const s = securities[i];
    const prefix = securities.length > 1 ? `Security ${i + 1}: ` : "";
    if (!s.typeOfSecurity?.trim()) {
      return `${prefix}Please select Type of Security.`;
    }
    if (!s.assetDescription?.trim()) {
      return `${prefix}Please enter Asset Description.`;
    }
    if (!s.estimatedValue?.trim()) {
      return `${prefix}Please enter Estimated Value.`;
    }
    if (!s.ownershipType?.trim()) {
      return `${prefix}Please select Ownership Type.`;
    }
    if (!s.locationOfAsset?.trim()) {
      return `${prefix}Please enter Location of Asset.`;
    }
  }

  // 2. Regulatory Compliance
  if (!regulatoryCompliance.businessRegistrationType?.trim()) {
    return "Please select Business Registration Type.";
  }
  if (!regulatoryCompliance.registrationNumber?.trim()) {
    return "Please enter Registration Number.";
  }
  if (regulatoryCompliance.gstApplicable) {
    if (!regulatoryCompliance.gstNumber?.trim()) {
      return "Please enter GST Number.";
    }
    if (regulatoryCompliance.gstNumber.trim().length < 15) {
      return "Please enter a valid 15-character GST Number.";
    }
  }
  if (!regulatoryCompliance.panNumber?.trim()) {
    return "Please enter Income Tax PAN Number.";
  }
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i;
  if (!panRegex.test(regulatoryCompliance.panNumber.trim())) {
    return "Please enter a valid 10-character PAN (e.g. ABCDE1234F).";
  }

  return null;
};

export const validateStep7 = (state: Step7ValidationState): string | null => {
  const { documents, agreeAccuracy, agreeVerification } = state;

  // 1. Mandatory Documents
  if (documents && documents.length > 0) {
    for (const doc of documents) {
      if (doc.isRequired) {
        const isUploaded =
          Boolean(doc.uploadedFileName?.trim()) ||
          Boolean(doc.uploadedFileUri?.trim());
        if (!isUploaded) {
          return `Please upload required document: ${doc.name}.`;
        }
      }
    }
  }

  // 2. Declarations
  if (!agreeAccuracy) {
    return "Please accept the accuracy declaration before submitting.";
  }
  if (!agreeVerification) {
    return "Please accept the verification and credit check consent before submitting.";
  }

  return null;
};

import {
  LoanDetailsFormData,
  LoanApplicantFormData,
  LoanPropertyFormData,
  LoanOwnershipFormData,
  LoanDocumentItem,
} from "../../types/loans.types";

export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
export const MOBILE_REGEX = /^[6-9]\d{9}$/;

export interface ValidateStepParams {
  currentStepIndex: number;
  loanDetails: LoanDetailsFormData;
  applicantDetails: LoanApplicantFormData;
  propertyDetails: LoanPropertyFormData;
  ownershipDetails: LoanOwnershipFormData;
  documents: LoanDocumentItem[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  alertTitle?: string;
  alertMessage?: string;
}

/** Step 1: Loan Requirement */
const validateLoanRequirementStep = (loanDetails: LoanDetailsFormData): ValidationResult => {
  const errs: Record<string, string> = {};

  if (!loanDetails.purpose || loanDetails.purpose.trim() === "") {
    errs.purpose = "Please select a loan type";
  } else if (
    (loanDetails.purpose === "Others" || loanDetails.purpose === "Other") &&
    (!loanDetails.customPurpose || loanDetails.customPurpose.trim() === "")
  ) {
    errs.purpose = "Please enter your custom loan type";
    errs.customPurpose = "Please enter your custom loan type";
  }

  const rawAmount = (loanDetails.requiredAmount || "").replace(/[^0-9]/g, "");
  const amountNum = Number(rawAmount);
  if (!loanDetails.requiredAmount || isNaN(amountNum) || amountNum <= 0) {
    errs.requiredAmount = "Enter valid required loan amount";
  } else if (amountNum < 10000) {
    errs.requiredAmount = "Minimum loan amount is ₹10,000";
  }

  const tenureNum = Number(loanDetails.preferredTenureMonths);
  if (
    !loanDetails.preferredTenureMonths ||
    loanDetails.preferredTenureMonths.trim() === "" ||
    isNaN(tenureNum) ||
    tenureNum < 1 ||
    tenureNum > 240
  ) {
    errs.preferredTenureMonths = "Please specify a valid tenure (1 to 240 months)";
  }

  if (!loanDetails.employmentType) {
    errs.employmentType = "Please select applicant type";
  }

  if (loanDetails.hasExistingLoans === undefined || loanDetails.hasExistingLoans === null) {
    errs.hasExistingLoans = "Please select whether you have existing customer status";
  }

  if (Object.keys(errs).length > 0) {
    return {
      isValid: false,
      errors: errs,
      alertTitle: "Required Fields Missing",
      alertMessage: "Please fill in all required fields on Step 1 before proceeding.",
    };
  }

  return { isValid: true, errors: {} };
};

/** Step 2: Applicant & Income */
const validateApplicantStep = (applicantDetails: LoanApplicantFormData): ValidationResult => {
  const errs: Record<string, string> = {};

  if (!applicantDetails.fullName || applicantDetails.fullName.trim() === "") {
    errs.fullName = "Full name is required";
  }

  const panClean = (applicantDetails.pan || "").trim().toUpperCase();
  if (!panClean || !PAN_REGEX.test(panClean)) {
    errs.pan = "Enter a valid 10-character PAN (e.g. ABCDE1234F)";
  }

  const mobileClean = (applicantDetails.mobile || "").trim();
  if (!mobileClean || !MOBILE_REGEX.test(mobileClean)) {
    errs.mobile = "Enter a valid 10-digit mobile number";
  }

  if (!applicantDetails.dob || applicantDetails.dob.trim() === "") {
    errs.dob = "Date of birth is required";
  }

  if (!applicantDetails.currentAddress || applicantDetails.currentAddress.trim() === "") {
    errs.currentAddress = "Current address is required";
  }

  if (!applicantDetails.gender || applicantDetails.gender.trim() === "") {
    errs.gender = "Please select gender";
  }

  if (!applicantDetails.maritalStatus || applicantDetails.maritalStatus.trim() === "") {
    errs.maritalStatus = "Please select marital status";
  }

  if (!applicantDetails.residenceType || applicantDetails.residenceType.trim() === "") {
    errs.residenceType = "Please select residence type";
  }

  if (!applicantDetails.yearsAtCurrentAddress || applicantDetails.yearsAtCurrentAddress.trim() === "") {
    errs.yearsAtCurrentAddress = "Please select years at current address";
  }

  if (!applicantDetails.employerCategory || applicantDetails.employerCategory.trim() === "") {
    errs.employerCategory = "Please select employer category";
  }

  if (!applicantDetails.employerName || applicantDetails.employerName.trim() === "") {
    errs.employerName = "Employer name is required";
  }

  if (!applicantDetails.totalWorkExperience || applicantDetails.totalWorkExperience.trim() === "") {
    errs.totalWorkExperience = "Please select total work experience";
  }

  if (!applicantDetails.yearsInCurrentJob || applicantDetails.yearsInCurrentJob.trim() === "") {
    errs.yearsInCurrentJob = "Please select years in current job";
  }

  const incomeNum = Number((applicantDetails.annualIncome || "").replace(/[^0-9]/g, ""));
  if (!applicantDetails.annualIncome || isNaN(incomeNum) || incomeNum <= 0) {
    errs.annualIncome = "Enter valid annual income";
  }

  if (applicantDetails.hasExistingLoans === undefined || applicantDetails.hasExistingLoans === null) {
    errs.hasExistingLoans = "Please select whether you have existing loans";
  }

  if (Object.keys(errs).length > 0) {
    return {
      isValid: false,
      errors: errs,
      alertTitle: "Required Fields Missing",
      alertMessage: "Please fill in all required applicant and income details on Step 2 before proceeding.",
    };
  }

  return { isValid: true, errors: {} };
};

/** Step 3: Property Details */
const validatePropertyStep = (propertyDetails: LoanPropertyFormData): ValidationResult => {
  const errs: Record<string, string> = {};

  const pinClean = (propertyDetails.pincode || "").trim();
  if (!pinClean || !/^\d{6}$/.test(pinClean)) {
    errs.pincode = "Enter a valid 6-digit PIN code";
  }

  if (!propertyDetails.city || propertyDetails.city.trim() === "") {
    errs.city = "City is required";
  }

  if (!propertyDetails.district || propertyDetails.district.trim() === "") {
    errs.district = "District is required";
  }

  if (!propertyDetails.state || propertyDetails.state.trim() === "") {
    errs.state = "Please select state";
  }

  if (!propertyDetails.propertyAddress || propertyDetails.propertyAddress.trim() === "") {
    errs.propertyAddress = "Property address is required";
  }

  if (!propertyDetails.propertyType || propertyDetails.propertyType.trim() === "") {
    errs.propertyType = "Please select property type";
  }

  if (!propertyDetails.propertySubType || propertyDetails.propertySubType.trim() === "") {
    errs.propertySubType = "Please select property sub-type";
  }

  if (!propertyDetails.constructionStatus || propertyDetails.constructionStatus.trim() === "") {
    errs.constructionStatus = "Please select construction status";
  }

  if (!propertyDetails.currentUsage || propertyDetails.currentUsage.trim() === "") {
    errs.currentUsage = "Please select current usage";
  }

  if (!propertyDetails.areaType || propertyDetails.areaType.trim() === "") {
    errs.areaType = "Please select area type";
  }

  const areaNum = Number((propertyDetails.area || "").replace(/[^0-9]/g, ""));
  if (!propertyDetails.area || isNaN(areaNum) || areaNum <= 0) {
    errs.area = "Enter valid area in sq. ft.";
  }

  if (!propertyDetails.propertyAge || propertyDetails.propertyAge.trim() === "") {
    errs.propertyAge = "Please select property age";
  }

  if (!propertyDetails.approvingAuthority || propertyDetails.approvingAuthority.trim() === "") {
    errs.approvingAuthority = "Please select approving authority";
  }

  const valNum = Number((propertyDetails.estimatedMarketValue || "").replace(/[^0-9]/g, ""));
  if (!propertyDetails.estimatedMarketValue || isNaN(valNum) || valNum <= 0) {
    errs.estimatedMarketValue = "Enter valid estimated market value";
  }

  if (Object.keys(errs).length > 0) {
    return {
      isValid: false,
      errors: errs,
      alertTitle: "Required Fields Missing",
      alertMessage: "Please fill in all required property details on Step 3 before proceeding.",
    };
  }

  return { isValid: true, errors: {} };
};

/** Step 4: Ownership Details */
const validateOwnershipStep = (ownershipDetails: LoanOwnershipFormData): ValidationResult => {
  const errs: Record<string, string> = {};

  if (!ownershipDetails.ownershipType || ownershipDetails.ownershipType.trim() === "") {
    errs.ownershipType = "Please select ownership type";
  }

  if (ownershipDetails.ownershipType === "Joint Ownership") {
    if (!ownershipDetails.coOwnerFullName || ownershipDetails.coOwnerFullName.trim() === "") {
      errs.coOwnerFullName = "Co-owner full name is required";
    }

    if (!ownershipDetails.coOwnerRelationship || ownershipDetails.coOwnerRelationship.trim() === "") {
      errs.coOwnerRelationship = "Please select relationship with co-owner";
    }

    const coPan = (ownershipDetails.coOwnerPan || "").trim().toUpperCase();
    if (!coPan || !PAN_REGEX.test(coPan)) {
      errs.coOwnerPan = "Enter a valid 10-character PAN for co-owner";
    }

    const coMobile = (ownershipDetails.coOwnerMobile || "").trim();
    if (!coMobile || !MOBILE_REGEX.test(coMobile)) {
      errs.coOwnerMobile = "Enter a valid 10-digit mobile number for co-owner";
    }
  }

  if (
    ownershipDetails.existingLoanType === "Others" ||
    ownershipDetails.existingLoanType === "Other"
  ) {
    errs.existingLoanType = "Please enter your existing loan type";
  }

  if (!ownershipDetails.isConfirmationChecked) {
    errs.isConfirmationChecked = "Please check the ownership confirmation declaration";
  }

  if (Object.keys(errs).length > 0) {
    return {
      isValid: false,
      errors: errs,
      alertTitle: "Required Confirmation",
      alertMessage: "Please fill in all required ownership details and check the declaration on Step 4.",
    };
  }

  return { isValid: true, errors: {} };
};

/** Step 5: Documents */
const validateDocumentsStep = (documents: LoanDocumentItem[]): ValidationResult => {
  const uploadedDocs = documents.filter((d) => Boolean(d.fileUri && d.fileUri.trim() !== ""));
  if (uploadedDocs.length === 0) {
    return {
      isValid: false,
      errors: {},
      alertTitle: "Document Upload Required",
      alertMessage: "Please upload at least one required document on Step 5 before proceeding to Review & Submit.",
    };
  }

  return { isValid: true, errors: {} };
};

export const validatePropertyLoanStep = (
  params: ValidateStepParams
): ValidationResult => {
  const {
    currentStepIndex,
    loanDetails,
    applicantDetails,
    propertyDetails,
    ownershipDetails,
    documents,
  } = params;

  if (currentStepIndex === 0) {
    return validateLoanRequirementStep(loanDetails);
  }
  else if (currentStepIndex === 1) {
    return validateApplicantStep(applicantDetails);
  }
  else if (currentStepIndex === 2) {
    return validatePropertyStep(propertyDetails);
  }
  else if (currentStepIndex === 3) {
    return validateOwnershipStep(ownershipDetails);
  }
  else if (currentStepIndex === 4) {
    return validateDocumentsStep(documents);
  }

  return { isValid: true, errors: {} };
};

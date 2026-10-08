import { GstValidators } from "@/modules/gst/utils/gstValidators";
import { AmendmentFormData, AmendmentStep, SupportingDoc } from "../types/gstAmendmentTypes";

export function validateGstinInput(
  gstin: string
): { isValid: true; error?: undefined } | { isValid: false; error: string } {
  const clean = gstin.trim().toUpperCase();
  if (!clean) {
    return { isValid: false, error: "GSTIN or Business ID is required." };
  }

  const isValidId =
    GstValidators.isValidGstin(clean) ||
    clean.startsWith("GST") ||
    clean.length >= 10;

  if (!isValidId) {
    return {
      isValid: false,
      error: "Enter a valid 15-character GSTIN (e.g. 29AAAAA0000A1Z5) or GST ID",
    };
  }

  return { isValid: true };
}

export function isFormDataDirty(
  currentStep: AmendmentStep,
  formData: AmendmentFormData,
  supportingDoc: SupportingDoc | null
): boolean {
  if (currentStep === "LANDING" || currentStep === "SUCCESS") return false;
  return Boolean(
    formData.newLegalBusinessName ||
      formData.newPrincipalAddress ||
      formData.newPrincipalCity ||
      formData.newPrincipalDistrict ||
      formData.newPrincipalState ||
      formData.newPrincipalPincode ||
      formData.newPrincipalNatureOfPremises ||
      formData.newAdditionalAddress ||
      formData.newAdditionalCity ||
      formData.newAdditionalPincode ||
      formData.newAdditionalNatureOfPremises ||
      formData.newBankName ||
      formData.newBankAccountNumber ||
      formData.confirmBankAccountNumber ||
      formData.newIfscCode ||
      formData.newAccountType ||
      formData.newSignatoryName ||
      formData.newSignatoryPan ||
      formData.newSignatoryDob ||
      formData.newSignatoryDesignation ||
      formData.newSignatoryMobile ||
      formData.newSignatoryEmail ||
      formData.newContactMobile ||
      formData.newContactEmail ||
      supportingDoc
  );
}

/** Field rules per amendment section; each adds messages to `errs`. */
const SECTION_RULES: Record<string, (formData: AmendmentFormData, errs: Record<string, string>) => void> = {
  "legal-name": (formData, errs) => {
    if (!GstValidators.isNotEmpty(formData.newLegalBusinessName, 2)) {
      errs.newLegalBusinessName = "New Legal Business Name is required";
    }
  },
  "principal-place": (formData, errs) => {
    if (!GstValidators.isNotEmpty(formData.newPrincipalAddress, 2)) {
      errs.newPrincipalAddress = "New Business Address is required";
    }
    if (!GstValidators.isNotEmpty(formData.newPrincipalCity, 2)) {
      errs.newPrincipalCity = "City is required";
    }
    if (!GstValidators.isNotEmpty(formData.newPrincipalDistrict, 2)) {
      errs.newPrincipalDistrict = "District is required";
    }
    if (!formData.newPrincipalState) {
      errs.newPrincipalState = "State / UT is required";
    }
    if (!/^\d{6}$/.test(formData.newPrincipalPincode.trim())) {
      errs.newPrincipalPincode = "Enter a valid 6-digit PIN code";
    }
    if (!formData.newPrincipalNatureOfPremises) {
      errs.newPrincipalNatureOfPremises = "Nature of Premises is required";
    }
  },
  "additional-place": (formData, errs) => {
    if (!GstValidators.isNotEmpty(formData.newAdditionalAddress, 2)) {
      errs.newAdditionalAddress = "New Additional Place Address is required";
    }
    if (!GstValidators.isNotEmpty(formData.newAdditionalCity, 2)) {
      errs.newAdditionalCity = "City is required";
    }
    if (!/^\d{6}$/.test(formData.newAdditionalPincode.trim())) {
      errs.newAdditionalPincode = "Enter a valid 6-digit PIN code";
    }
    if (!formData.newAdditionalNatureOfPremises) {
      errs.newAdditionalNatureOfPremises = "Nature of Premises is required";
    }
  },
  "bank-accounts": (formData, errs) => {
    if (!GstValidators.isNotEmpty(formData.newBankName, 2)) {
      errs.newBankName = "New Bank Name is required";
    }
    if (!GstValidators.isValidBankAccount(formData.newBankAccountNumber)) {
      errs.newBankAccountNumber = "Enter a valid 9 to 18 digit bank account number";
    }
    if (!formData.confirmBankAccountNumber) {
      errs.confirmBankAccountNumber = "Confirm Account Number is required";
    } else if (formData.confirmBankAccountNumber !== formData.newBankAccountNumber) {
      errs.confirmBankAccountNumber = "Bank account numbers do not match";
    }
    if (!GstValidators.isValidIfsc(formData.newIfscCode)) {
      errs.newIfscCode = "Enter a valid 11-character IFSC code (e.g. HDFC0001234)";
    }
    if (!formData.newAccountType) {
      errs.newAccountType = "Account Type is required";
    }
  },
  "authorised-signatories": (formData, errs) => {
    if (!GstValidators.isNotEmpty(formData.newSignatoryName, 2)) {
      errs.newSignatoryName = "New Signatory Name is required";
    }
    if (!GstValidators.isValidPan(formData.newSignatoryPan)) {
      errs.newSignatoryPan = "Enter a valid 10-character PAN (e.g. ABCDE1234F)";
    }
    if (!formData.newSignatoryDob || formData.newSignatoryDob.trim().length < 8) {
      errs.newSignatoryDob = "Date of Birth is required (dd-mm-yyyy)";
    }
    if (!GstValidators.isNotEmpty(formData.newSignatoryDesignation, 2)) {
      errs.newSignatoryDesignation = "Designation is required";
    }
    if (!GstValidators.isValidMobile(formData.newSignatoryMobile)) {
      errs.newSignatoryMobile = "Enter a valid 10-digit mobile number";
    }
    if (!GstValidators.isValidEmail(formData.newSignatoryEmail)) {
      errs.newSignatoryEmail = "Enter a valid email address";
    }
  },
  "contact-details": (formData, errs) => {
    if (!GstValidators.isValidMobile(formData.newContactMobile)) {
      errs.newContactMobile = "Enter a valid 10-digit mobile number";
    }
    if (!GstValidators.isValidEmail(formData.newContactEmail)) {
      errs.newContactEmail = "Enter a valid email address";
    }
  },
};

export function validateSectionForm(
  sectionId: string,
  formData: AmendmentFormData,
  supportingDoc: SupportingDoc | null
): { isValid: boolean; errors: Record<string, string> } {
  const errs: Record<string, string> = {};

  if (Object.prototype.hasOwnProperty.call(SECTION_RULES, sectionId)) {
    SECTION_RULES[sectionId](formData, errs);
  }

  if (!supportingDoc) {
    errs.supportingDoc = "Supporting proof is required for an amendment";
  }

  return {
    isValid: Object.keys(errs).length === 0,
    errors: errs,
  };
}

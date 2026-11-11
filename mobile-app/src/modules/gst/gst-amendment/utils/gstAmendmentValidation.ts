import { AmendmentFormData, AmendmentStep, SupportingDoc } from "../types/gstAmendmentTypes";
import {
  GSTIN_REGEX,
  VALID_GSTIN_STATE_CODES,
  ALLOWED_PAN_CATEGORIES,
  extractPanFromGstin,
} from "@/shared/validators/gstValidators";
import { validateGstinFull } from "@/modules/gst/utils/gstValidation";
import { parseDDMMYYYY, isFutureDate } from "@/shared/formatters/dateFormatter";
import { validateGstDob } from "@/modules/gst/validators/dobValidators";
import { validateAmendmentEmail } from "./gstAmendmentEmailValidation";
import { isFormDataDirty } from "./gstAmendmentDirtyCheck";

export { validateAmendmentEmail, isFormDataDirty };

export {
  GSTIN_REGEX,
  VALID_GSTIN_STATE_CODES,
  ALLOWED_PAN_CATEGORIES,
  extractPanFromGstin,
};

/**
 * Exclusive allowlist for the Authorised Signatory designation title field.
 * Only these formal honorifics are accepted; arbitrary text is rejected.
 */
export const ALLOWED_DESIGNATION_TITLES: ReadonlySet<string> = new Set([
  "MR", "MS", "DR", "MRS", "DRS",
]);

/**
 * Validates a 10-character PAN number according to statutory structure:
 * - Positions 1–3: Alphabetic characters A–Z
 * - Position 4: One of P, C, H, F, A, B, T, L, J, G
 * - Position 5: Alphabetic character A–Z
 * - Positions 6–9: Numeric digits 0–9
 * - Position 10: Alphabetic character A–Z
 */
export function validatePanNumber(pan: string, isTouched = true): string | null {
  const clean = (pan || "").trim().toUpperCase();
  if (!clean) return isTouched ? "Enter PAN number." : null;
  if (clean.length !== 10) return "PAN must be 10 characters.";
  if (!/^[A-Z]{3}[ABCFGHJLPT][A-Z][0-9]{4}[A-Z]$/.test(clean)) {
    return "Enter a valid PAN number.";
  }
  return null;
}

export function validateGstinInput(
  gstin: string
): { isValid: true; error?: undefined } | { isValid: false; error: string } {
  if (!(gstin || "").trim()) return { isValid: false, error: "Enter GSTIN" };
  const error = validateGstinFull(gstin);
  if (error) return { isValid: false, error };
  return { isValid: true };
}


export const isValidPincode = (pincode: string): boolean => {
  return /^[1-9][0-9]{5}$/.test(pincode.trim());
};

export const hasEmoji = (val: string): boolean => {
  const nonAscii = val.replace(/[\x00-\x7F]/g, "");
  if (!nonAscii) return false;
  return /(\p{Extended_Pictographic}|\p{Emoji_Presentation})/u.test(nonAscii);
};


/**
 * Universal single-source validator for every GST Amendment text field.
 * Handles both real-time typing and on-submit form validation.
 */
export function validateAmendmentFieldValue(
  field: keyof AmendmentFormData,
  value: string,
  allData: AmendmentFormData,
  isTouched = true
): string | null {
  const trimmed = (value || "").trim();

  // If empty and touched, show the field's direct required prompt
  if (!trimmed) {
    if (!isTouched) return null;
    switch (field) {
      case "newLegalBusinessName": return "Legal Name is required.";
      case "newPrincipalAddress":
      case "newAdditionalAddress": return "Enter business address";
      case "newPrincipalCity":
      case "newAdditionalCity": return "Enter city or town";
      case "newPrincipalDistrict": return "Enter district";
      case "newPrincipalPincode":
      case "newAdditionalPincode": return "Enter PIN code";
      case "newBankName": return "Enter bank name";
      case "newBankAccountNumber": return "Enter bank account number";
      case "confirmBankAccountNumber": return "Re-enter bank account number";
      case "newIfscCode": return "Enter IFSC code";
      case "newSignatoryName": return "Enter full name";
      case "newSignatoryPan": return "Enter PAN number.";
      case "newSignatoryDob": return "Select date of birth.";
      case "newSignatoryDesignation": return "Enter a valid designation (MR, MS, DR or DRS).";
      case "newSignatoryMobile":
      case "newContactMobile": return "Enter mobile number";
      case "newSignatoryEmail": return "Email address is required.";
      case "newContactEmail": return "Enter email address";
      default: return null;
    }
  }

  // Reject emojis across all amendment fields
  if (hasEmoji(value)) {
    switch (field) {
      case "newLegalBusinessName": return "Enter a valid legal business name";
      case "newPrincipalAddress":
      case "newAdditionalAddress": return "Enter a valid business address";
      case "newPrincipalCity":
      case "newAdditionalCity": return "Enter a valid city or town";
      case "newPrincipalDistrict": return "Enter a valid district";
      case "newBankName": return "Enter a valid bank name";
      case "newSignatoryName": return "Enter a valid full name";
      case "newSignatoryDesignation": return "Enter a valid designation (MR, MS, DR or DRS).";
      case "newSignatoryPan": return "Enter a valid PAN number.";
      case "newIfscCode": return "Enter a valid IFSC code";
      case "newPrincipalPincode":
      case "newAdditionalPincode": return "Enter a valid 6-digit PIN code";
      case "newBankAccountNumber":
      case "confirmBankAccountNumber": return "Enter a valid bank account number";
      case "newSignatoryMobile":
      case "newContactMobile": return "Enter a valid 10-digit mobile number";
      case "newSignatoryEmail": return "Please enter a valid email address.";
      case "newContactEmail": return "Enter a valid email address";
      default: return null;
    }
  }

  switch (field) {
    case "newLegalBusinessName": {
      if (trimmed.length > 25) return "Legal Name cannot exceed 25 characters.";
      if (!/[a-zA-Z\p{L}]/u.test(trimmed)) return "Enter a valid legal business name";
      if (/^\d+$/.test(trimmed.replace(/[\s.&',\-/]/g, ""))) return "Enter a valid legal business name";
      if (!/^[a-zA-Z0-9\p{L}\s.&',\-\/]+$/u.test(trimmed)) {
        return "Enter a valid legal business name";
      }
      return null;
    }

    case "newPrincipalAddress":
    case "newAdditionalAddress": {
      if (trimmed.length < 5) return "Business address is too short";
      if (trimmed.length > 200) return "Business address exceeds the maximum length";
      // Address cannot be digits only regardless of length
      const strippedOfPunctuationAndSpace = trimmed.replace(/[\s,.\-/#()&':;]/g, "");
      if (/^\d+$/.test(strippedOfPunctuationAndSpace)) {
        return "Enter a valid business address";
      }
      if (!/[a-zA-Z\p{L}]/u.test(trimmed)) return "Enter a valid business address";
      if (!/^[a-zA-Z0-9\p{L}\s,.\-/#()&':;]+$/u.test(trimmed)) {
        return "Enter a valid business address";
      }
      return null;
    }

    case "newPrincipalCity":
    case "newAdditionalCity": {
      if (trimmed.length > 50) return "City or town exceeds the maximum length";
      if (trimmed.length < 2) return "Enter a valid city or town";
      if (/\d/.test(trimmed)) return "Enter a valid city or town";
      if (!/[a-zA-Z\p{L}]/u.test(trimmed)) return "Enter a valid city or town";
      if (!/^[a-zA-Z\p{L}\s.'-]{2,50}$/u.test(trimmed)) return "Enter a valid city or town";
      return null;
    }

    case "newPrincipalDistrict": {
      if (trimmed.length > 50) return "District exceeds the maximum length";
      if (trimmed.length < 2) return "Enter a valid district";
      if (/\d/.test(trimmed)) return "Enter a valid district";
      if (!/[a-zA-Z\p{L}]/u.test(trimmed)) return "Enter a valid district";
      if (!/^[a-zA-Z\p{L}\s.'-]{2,50}$/u.test(trimmed)) return "Enter a valid district";
      return null;
    }

    case "newPrincipalPincode":
    case "newAdditionalPincode": {
      if (!/^[1-9][0-9]{5}$/.test(trimmed)) return "Enter a valid 6-digit PIN code";
      return null;
    }

    case "newBankName": {
      if (trimmed.length > 100) return "Bank name exceeds the maximum length";
      if (trimmed.length < 2) return "Enter a valid bank name";
      if (/\d/.test(trimmed)) return "Enter a valid bank name";
      if (!/^[a-zA-Z\p{L}\s.&'-]{2,100}$/u.test(trimmed)) return "Enter a valid bank name";
      return null;
    }

    case "newBankAccountNumber": {
      if (/[^0-9]/.test(trimmed)) return "Enter a valid bank account number";
      if (/^0+$/.test(trimmed)) return "Enter a valid bank account number";
      if (trimmed.length < 9 || trimmed.length > 18) return "Enter a valid bank account number";
      return null;
    }

    case "confirmBankAccountNumber": {
      if (/[^0-9]/.test(trimmed)) return "Enter a valid bank account number";
      if (trimmed.length < 9 || trimmed.length > 18) return "Enter a valid bank account number";
      if (allData.newBankAccountNumber && trimmed !== allData.newBankAccountNumber.trim()) {
        return "Bank account numbers do not match";
      }
      return null;
    }

    case "newIfscCode": {
      const upper = trimmed.toUpperCase();
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(upper)) return "Enter a valid IFSC code";
      return null;
    }

    case "newSignatoryName": {
      if (trimmed.length > 100) return "Full name exceeds the maximum length";
      if (trimmed.length < 2) return "Enter a valid full name";
      if (/\d/.test(trimmed)) return "Enter a valid full name";
      if (!/^[a-zA-Z\p{L}\s.'-]{2,100}$/u.test(trimmed)) return "Enter a valid full name";
      return null;
    }

    case "newSignatoryPan": {
      return validatePanNumber(trimmed, isTouched);
    }

    case "newSignatoryDob": {
      const err = validateGstDob(trimmed);
      return err || null;
    }

    case "newSignatoryDesignation": {
      if (/[^A-Za-z]/.test(trimmed)) return "Enter a valid designation (MR, MS, DR or DRS).";
      if (!ALLOWED_DESIGNATION_TITLES.has(trimmed.toUpperCase())) {
        return "Enter a valid designation (MR, MS, DR or DRS).";
      }
      return null;
    }

    case "newSignatoryMobile":
    case "newContactMobile": {
      const clean = trimmed.replace(/\D/g, "");
      if (clean.length !== 10 || !/^[6-9]\d{9}$/.test(clean)) {
        return "Enter a valid 10-digit mobile number";
      }
      return null;
    }

    case "newSignatoryEmail": {
      if (!validateAmendmentEmail(trimmed)) {
        return "Please enter a valid email address.";
      }
      return null;
    }

    case "newContactEmail": {
      if (!validateAmendmentEmail(trimmed)) {
        return "Enter a valid email address";
      }
      return null;
    }

    default:
      return null;
  }
}

/** Field rules per amendment section; each adds messages to `errs`. */
const SECTION_RULES: Record<string, (formData: AmendmentFormData, errs: Record<string, string>) => void> = {
  "legal-name": (formData, errs) => {
    const err = validateAmendmentFieldValue("newLegalBusinessName", formData.newLegalBusinessName, formData, true);
    if (err) errs.newLegalBusinessName = err;
  },
  "principal-place": (formData, errs) => {
    const addrErr = validateAmendmentFieldValue("newPrincipalAddress", formData.newPrincipalAddress, formData, true);
    if (addrErr) errs.newPrincipalAddress = addrErr;

    const cityErr = validateAmendmentFieldValue("newPrincipalCity", formData.newPrincipalCity, formData, true);
    if (cityErr) errs.newPrincipalCity = cityErr;

    const distErr = validateAmendmentFieldValue("newPrincipalDistrict", formData.newPrincipalDistrict, formData, true);
    if (distErr) errs.newPrincipalDistrict = distErr;

    if (!formData.newPrincipalState) {
      errs.newPrincipalState = "Select state or union territory";
    }

    const pinErr = validateAmendmentFieldValue("newPrincipalPincode", formData.newPrincipalPincode, formData, true);
    if (pinErr) errs.newPrincipalPincode = pinErr;

    if (!formData.newPrincipalNatureOfPremises) {
      errs.newPrincipalNatureOfPremises = "Select nature of possession";
    }
  },
  "additional-place": (formData, errs) => {
    const addrErr = validateAmendmentFieldValue("newAdditionalAddress", formData.newAdditionalAddress, formData, true);
    if (addrErr) errs.newAdditionalAddress = addrErr;

    const cityErr = validateAmendmentFieldValue("newAdditionalCity", formData.newAdditionalCity, formData, true);
    if (cityErr) errs.newAdditionalCity = cityErr;

    const pinErr = validateAmendmentFieldValue("newAdditionalPincode", formData.newAdditionalPincode, formData, true);
    if (pinErr) errs.newAdditionalPincode = pinErr;

    if (!formData.newAdditionalNatureOfPremises) {
      errs.newAdditionalNatureOfPremises = "Select nature of possession";
    }
  },
  "bank-accounts": (formData, errs) => {
    (["newBankName", "newBankAccountNumber", "confirmBankAccountNumber", "newIfscCode"] as const).forEach((f) => {
      const err = validateAmendmentFieldValue(f, formData[f], formData, true);
      if (err) errs[f] = err;
    });
    if (!formData.newAccountType) errs.newAccountType = "Select account type";
  },
  "authorised-signatories": (formData, errs) => {
    const fields = [
      "newSignatoryName", "newSignatoryPan", "newSignatoryDob",
      "newSignatoryDesignation", "newSignatoryMobile", "newSignatoryEmail",
    ] as const;
    fields.forEach((f) => {
      const err = validateAmendmentFieldValue(f, formData[f], formData, true);
      if (err) errs[f] = err;
    });
  },
  "contact-details": (formData, errs) => {
    const fields = ["newContactMobile", "newContactEmail"] as const;
    fields.forEach((f) => {
      const err = validateAmendmentFieldValue(f, formData[f], formData, true);
      if (err) errs[f] = err;
    });
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

  if (!supportingDoc || !supportingDoc.uri) {
    errs.supportingDoc = "Upload supporting document";
  }

  return {
    isValid: Object.keys(errs).length === 0,
    errors: errs,
  };
}

/**
 * Real-time field validator for keystroke / blur feedback.
 * Returns error string or null if valid.
 */
export function validateFieldRealtime(
  field: keyof AmendmentFormData,
  value: string,
  allData: AmendmentFormData
): string | null {
  return validateAmendmentFieldValue(field, value, allData, true);
}

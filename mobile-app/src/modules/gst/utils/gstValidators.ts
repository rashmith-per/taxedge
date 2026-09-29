import { isFutureDate, parseDDMMYYYY } from "@/shared/formatters/dateFormatter";
import {
  validateEmail,
  validateFullName,
} from "@/shared/validators/indianTaxValidators";

/**
 * GST & Tax Validation Utilities
 * Follows standard Indian Government format rules for PAN, Aadhaar, GSTIN, IFSC, etc.
 */

export const GstValidators = {
  isValidBusinessName: (value: string): boolean => {
    const clean = value.trim();
    if (!clean || clean !== value || /\s{2,}/.test(clean)) return false;
    return /^[\p{L}\p{N}]+(?:[ .,&'()\/-][\p{L}\p{N}]+)*$/u.test(clean);
  },

  isValidBranchName: (value: string): boolean => {
    const clean = value.trim();
    if (!clean || clean !== value || /\s{2,}/.test(clean)) return false;
    return /^[\p{L}\p{N}]+(?:[ .,&'()\/-][\p{L}\p{N}]+)*$/u.test(clean);
  },

  /**
   * Validates Indian PAN Number: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F)
   */
  isValidPan: (pan: string): boolean => {
    const cleanPan = pan.trim().toUpperCase();
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(cleanPan);
  },

  /**
   * Validates 12-digit Indian Aadhaar Number (allows spaces/dashes)
   */
  isValidAadhaar: (aadhaar: string): boolean => {
    const cleanAadhaar = aadhaar.replace(/[\s-]/g, "");
    return /^\d{12}$/.test(cleanAadhaar);
  },

  /**
   * Validates 10-digit Indian Mobile Number starting with 6, 7, 8, or 9
   */
  isValidMobile: (mobile: string): boolean => {
    const cleanMobile = mobile.replace(/^(\+91|0|\s)/g, "").replace(/[\s-]/g, "");
    return /^[6-9]\d{9}$/.test(cleanMobile);
  },

  /**
   * Validates Email Address format
   */
  isValidEmail: (email: string): boolean => {
    return validateEmail(email);
  },

  isBankAccountMatch: (account: string, confirmation: string): boolean =>
    account.trim() === confirmation.trim(),

  /**
   * Validates Indian 15-character GSTIN (e.g. 29PAVAN1234K1Z5)
   */
  isValidGstin: (gstin: string): boolean => {
    const cleanGstin = gstin.trim().toUpperCase();
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstinRegex.test(cleanGstin);
  },

  /**
   * Validates 11-character Indian IFSC Code (e.g. HDFC0001234, SBIN0001234)
   */
  isValidIfsc: (ifsc: string): boolean => {
    const cleanIfsc = ifsc.trim().toUpperCase();
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return ifscRegex.test(cleanIfsc);
  },

  /**
   * Validates Bank Account Number (between 9 and 18 digits)
   */
  isValidBankAccount: (account: string): boolean => {
    const cleanAcc = account.trim().replace(/[\s-]/g, "");
    return /^\d{9,18}$/.test(cleanAcc);
  },

  /**
   * Validates UPI ID format (e.g. username@bank / pavan@ybl)
   */
  isValidUpi: (upi: string): boolean => {
    const cleanUpi = upi.trim();
    const upiRegex = /^[\w.\-_]{2,}@[\w\-]{2,}$/;
    return upiRegex.test(cleanUpi);
  },

  /**
   * Validates standard string length (minimum non-empty length)
   */
  isNotEmpty: (str: string, minLength: number = 2): boolean => {
    return str.trim().length >= minLength;
  },

  /**
   * Validates Debit / Credit Card number (16 digits)
   */
  isValidCardNumber: (cardNumber: string): boolean => {
    const cleanNum = cardNumber.replace(/[\s-]/g, "");
    return /^\d{16}$/.test(cleanNum);
  },

  /**
   * Validates Card Expiry Date (MM/YY)
   */
  isValidExpiry: (expiry: string): boolean => {
    const cleanExp = expiry.trim();
    return /^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(cleanExp);
  },

  /**
   * Validates Card CVV (3 or 4 digits)
   */
  isValidCvv: (cvv: string): boolean => {
    const cleanCvv = cvv.trim();
    return /^\d{3,4}$/.test(cleanCvv);
  },

  /**
   * Validates full card form
   */
  validateCard: (data: { cardNumber: string; cardHolder: string; expiry: string; cvv: string }): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!GstValidators.isValidCardNumber(data.cardNumber)) errs.cardNumber = "Enter a valid 16-digit card number";
    if (!GstValidators.isNotEmpty(data.cardHolder, 2)) errs.cardHolder = "Cardholder name is required";
    if (!GstValidators.isValidExpiry(data.expiry)) errs.expiry = "Enter a valid expiry (MM/YY)";
    if (!GstValidators.isValidCvv(data.cvv)) errs.cvv = "Enter a valid CVV";
    return errs;
  },

  /**
   * Validates net banking form
   */
  validateNetBanking: (data: { selectedBank: string; customerId: string }): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!GstValidators.isNotEmpty(data.selectedBank, 2)) errs.selectedBank = "Please select your bank";
    if (!GstValidators.isNotEmpty(data.customerId, 4)) errs.customerId = "Customer / User ID is required";
    return errs;
  },

  /**
   * Functional field-level validator for GST Business Step
   */
  validateBusinessField: (field: string, value: string): string => {
    switch (field) {
      case "legalName":
        if (!value.trim()) return "Legal Name is required";
        if (!GstValidators.isValidBusinessName(value)) return "Enter a valid legal business name";
        return "";
      case "businessName":
      case "registeredBusinessName":
        if (!value.trim()) return "Business / Trade Name is required";
        if (!GstValidators.isValidBusinessName(value)) return "Enter a valid business or trade name";
        return "";
      case "businessType":
        if (!GstValidators.isNotEmpty(value, 2)) return "Please select a business type";
        return "";
      case "natureOfBusiness":
        if (!GstValidators.isNotEmpty(value, 2)) return "Please select nature of business";
        return "";
      case "businessStartDate":
        if (!GstValidators.isNotEmpty(value, 1)) return "Business start date is required";
        {
          const startDate = parseDDMMYYYY(value);
          if (!startDate) return "Enter a valid date in DD-MM-YYYY format";
          if (isFutureDate(startDate)) return "Commencement date cannot be in the future";
        }
        return "";
      case "reasonForRegistration":
        if (!GstValidators.isNotEmpty(value, 2)) return "Please select a reason";
        return "";
      case "compositionScheme":
        if (!GstValidators.isNotEmpty(value, 2)) return "Please select an option";
        return "";
      case "aadhaarConsent":
        if (value !== "true") return "You must consent to Aadhaar authentication";
        return "";
      case "businessAddress":
        if (!GstValidators.isNotEmpty(value, 5)) return "Full business address with pincode is required";
        return "";
      case "placeOfBusiness":
        if (!GstValidators.isNotEmpty(value, 2)) return "Please select a place type";
        return "";
      case "city":
        if (!GstValidators.isNotEmpty(value, 2)) return "City is required";
        return "";
      case "district":
        if (!GstValidators.isNotEmpty(value, 2)) return "District is required";
        return "";
      case "state":
        if (!GstValidators.isNotEmpty(value, 2)) return "State is required";
        return "";
      case "pinCode":
        if (!/^\d{6}$/.test(value)) return "Enter a valid 6-digit PIN code";
        return "";
      case "hsnCode":
        if (!/^\d{4,8}$/.test(value)) return "HSN/SAC code must be 4 to 8 digits";
        return "";
      case "accountHolderName":
        if (!value.trim()) return "Account holder name is required";
        if (!validateFullName(value)) return "Enter a valid account holder name";
        return "";
      case "bankAccountNumber":
        if (!value.trim()) return "Bank account number is required";
        if (!GstValidators.isValidBankAccount(value)) return "Enter a valid bank account number (9 to 18 digits)";
        return "";
      case "confirmBankAccountNumber":
        if (!value.trim()) return "Confirm account number is required";
        if (!GstValidators.isValidBankAccount(value)) return "Enter a valid bank account number";
        return "";
      case "ifscCode":
        if (!value.trim()) return "IFSC code is required";
        if (!GstValidators.isValidIfsc(value)) return "Enter a valid 11-digit IFSC code (e.g. HDFC0001234)";
        return "";
      case "bankName":
        if (!GstValidators.isNotEmpty(value, 2)) return "Bank name is required";
        return "";
      case "branchName":
        if (!value.trim()) return "Branch name is required";
        if (!GstValidators.isValidBranchName(value)) return "Enter a valid branch name";
        return "";
      case "accountType":
        if (!GstValidators.isNotEmpty(value, 2)) return "Account type is required";
        return "";
      case "signatoryName":
        if (!value.trim()) return "Signatory name is required";
        if (!validateFullName(value)) return "Enter a valid signatory name";
        return "";
      case "signatoryPan":
        if (!GstValidators.isValidPan(value)) return "Enter a valid 10-character PAN";
        return "";
      case "signatoryDob": {
        if (!GstValidators.isNotEmpty(value, 1)) return "Date of birth is required";
        const dob = parseDDMMYYYY(value);
        if (!dob) return "Enter a valid date in DD-MM-YYYY format";
        if (isFutureDate(dob)) return "Date of birth cannot be in the future";
        return "";
      }
      case "signatoryDesignation":
        if (!GstValidators.isNotEmpty(value, 2)) return "Designation is required";
        return "";
      case "signatoryMobile":
        if (!GstValidators.isValidMobile(value)) return "Enter a valid 10-digit mobile number";
        return "";
      case "signatoryEmail":
        if (!validateEmail(value)) return "Enter a valid email address";
        return "";
      default:
        return "";
    }
  },

  /**
   * Functional whole-form validator for Business Details using reduce (no loops)
   */
  validateBusinessForm: (data: Record<string, string>): Record<string, string> => {
    const fields = [
      "legalName",
      "businessName",
      "businessType",
      "natureOfBusiness",
      "placeOfBusiness",
      "businessStartDate",
      "reasonForRegistration",
      "compositionScheme",
      "businessAddress",
      "city",
      "district",
      "state",
      "pinCode",
      "hsnCode",
      "accountHolderName",
      "bankAccountNumber",
      "confirmBankAccountNumber",
      "ifscCode",
      "bankName",
      "branchName",
      "accountType",
      "signatoryName",
      "signatoryPan",
      "signatoryDob",
      "signatoryDesignation",
      "signatoryMobile",
      "signatoryEmail",
      "aadhaarConsent",
    ];
    const errors = fields.reduce<Record<string, string>>((acc, key) => {
      const rawValue = data[key] || (key === "businessName" ? data["registeredBusinessName"] : "");
      const value = typeof rawValue === "boolean" ? String(rawValue) : String(rawValue || "");
      const error = GstValidators.validateBusinessField(key, value);
      return error ? { ...acc, [key]: error } : acc;
    }, {});

    if (
      !errors.bankAccountNumber &&
      !errors.confirmBankAccountNumber &&
      !GstValidators.isBankAccountMatch(data.bankAccountNumber, data.confirmBankAccountNumber)
    ) {
      errors.confirmBankAccountNumber = "Account numbers do not match.";
    }

    return errors;
  },
};

import { FilingDocItem } from "../config/gstFilingDocumentsConfig";
import { getFilingPeriodsForFrequency } from "../components/GstFilingPeriodStep/gstPeriodUtils";
import {
  GSTIN_REGEX,
  VALID_GSTIN_STATE_CODES,
  ALLOWED_PAN_CATEGORIES,
  extractPanFromGstin,
} from "@/shared/validators/gstValidators";
import { validateGstinFull } from "@/modules/gst/utils/gstValidation";

export {
  GSTIN_REGEX,
  VALID_GSTIN_STATE_CODES,
  ALLOWED_PAN_CATEGORIES,
  extractPanFromGstin,
};

/** Permitted upper monetary ceiling for estimated figures: ₹999 Crore (9,990,000,000.00) */
export const MAX_ESTIMATED_AMOUNT = 9990000000;
export const ESTIMATED_AMOUNT_REGEX = /^\d{1,10}(\.\d{1,2})?$/;

/**
 * Validates a GSTIN string with real-time feedback.
 * Delegates full-format check to the canonical validateGstinFull.
 *
 * @param gstin Raw or cleaned GSTIN string
 * @param isTouched Whether the field has been touched or a form submit was attempted
 */
export function validateGstin(gstin: string, isTouched = true): string | null {
  const clean = (gstin || "").trim().toUpperCase();
  if (!clean) return isTouched ? "Enter GSTIN" : null;
  if (!isTouched && clean.length < 15) return null;
  return validateGstinFull(clean);
}

/**
 * Validates monetary amounts for estimated sales, purchases, and ITC.
 * Enforces 10-digit integer limit, max 2 decimals, non-negative, and <= 9990000000 (₹999 Crore).
 */
export function validateEstimatedAmount(
  value: string | number | undefined | null,
  fieldName = "amount",
  isRequired = false
): string | null {
  if (value === undefined || value === null) {
    return isRequired ? `Enter ${fieldName}` : null;
  }

  const rawStr = String(value).replace(/[₹,\s]/g, "").trim();

  if (!rawStr) {
    return isRequired ? `Enter ${fieldName}` : null;
  }

  if (rawStr.startsWith("-")) {
    return "Negative amounts are not allowed.";
  }

  // Check for negative numbers anywhere
  if (rawStr.includes("-")) {
    return "Negative amounts are not allowed.";
  }

  // Check for invalid non-numeric/non-decimal characters (alphabets, symbols)
  if (/[^\d.]/.test(rawStr)) {
    return "Please enter a valid amount.";
  }

  // Multiple decimal points
  const dotCount = (rawStr.match(/\./g) || []).length;
  if (dotCount > 1) {
    return "Please enter a valid amount.";
  }

  const [intPart = "", decPart] = rawStr.split(".");

  // Check decimal places
  if (decPart !== undefined && decPart.length > 2) {
    return "Maximum 2 decimal places allowed.";
  }

  // Check maximum digits before decimal (10 digits)
  if (intPart.length > 10) {
    return "Maximum 10 digits allowed before decimal.";
  }

  // Strict regex check: ^\d{1,10}(\.\d{1,2})?$
  if (!ESTIMATED_AMOUNT_REGEX.test(rawStr)) {
    return "Please enter a valid amount.";
  }

  const num = Number(rawStr);

  if (!Number.isFinite(num) || isNaN(num)) {
    return "Please enter a valid amount.";
  }

  if (num < 0) {
    return "Negative amounts are not allowed.";
  }

  if (num > MAX_ESTIMATED_AMOUNT) {
    return "Amount exceeds the permitted limit (Max: ₹999 Cr).";
  }

  return null;
}

/**
 * Validates Filing Frequency and Return Period combination.
 */
export function validatePeriodSelection(
  periodType?: string,
  financialYear?: string,
  filingPeriod?: string
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!periodType || !periodType.trim()) {
    errors.periodType = "Please select a filing frequency";
  }

  if (!financialYear || !financialYear.trim()) {
    errors.financialYear = "Please select a financial year";
  }

  const periodVal = (filingPeriod || "").trim();
  if (!periodVal) {
    errors.filingPeriod = "Please select a filing return period";
  } else if (periodType && financialYear) {
    const validPeriods = getFilingPeriodsForFrequency(periodType, financialYear);
    if (!validPeriods.includes(periodVal)) {
      errors.filingPeriod = "Selected period is invalid for the chosen frequency";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates document completeness according to filing nature.
 * For Regular Return, all 12 checklist documents are strictly mandatory.
 * For Nil Return, documents are not required.
 */
export function validateFilingDocuments(
  documents: readonly FilingDocItem[],
  filingNature: string
): { isValid: boolean; missingCount: number; missingNames: string[] } {
  if (filingNature === "Nil Return") {
    return { isValid: true, missingCount: 0, missingNames: [] };
  }

  const missing = documents.filter((d) => !d.fileUri || d.fileUri.trim() === "");
  return {
    isValid: missing.length === 0,
    missingCount: missing.length,
    missingNames: missing.map((d) => d.name),
  };
}

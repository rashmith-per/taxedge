/**
 * GST Input Spacing & Space Normalization Utilities
 *
 * Implements strict space validation and normalization rules for the 5 permitted GST modules:
 * 1. GST Registration
 * 2. GST Filing
 * 3. GST Compliance
 * 4. GST Amendment
 * 5. GST Certificate
 *
 * Rules:
 * - Prevent leading spaces.
 * - Prevent trailing spaces on blur / submit / finalize.
 * - Disallow multiple consecutive spaces between words (collapse to single space).
 * - Allow single spaces between words as user types (supporting trailing space temporarily during typing so user can type next word, or immediately collapsing multiple spaces).
 * - Field-specific character sanitizers for Names, Business Names, Address, Structured, Numeric fields.
 */

import { removeEmoji } from "./gstEmojiFilter";

export type GstFieldType =
  | "personName"
  | "businessName"
  | "bankName"
  | "address"
  | "alphabeticLocation"
  | "structuredAlphanumeric"
  | "numeric"
  | "email"
  | "generalText";

/**
 * Normalizes live user input for controlled TextInput components:
 * - Removes emojis
 * - Removes leading whitespace
 * - Collapses consecutive spaces into a single space
 * - Preserves a single trailing space while typing so the user can type the next word
 */
export function normalizeLiveInput(text?: string | null): string {
  if (!text || typeof text !== "string") return "";
  let val = removeEmoji(text);
  // Remove leading spaces/whitespace
  val = val.replace(/^[\s\uFEFF\xA0]+/, "");
  // Collapse multiple consecutive spaces to a single space
  val = val.replace(/ {2,}/g, " ");
  // Disallow newlines, carriage returns, or tabs if single line
  val = val.replace(/[\r\n\t\f\v]+/g, " ");
  // Collapse spaces again in case tabs/newlines created doubles
  val = val.replace(/ {2,}/g, " ");
  return val;
}

/**
 * Normalizes multiline live user input (e.g. Remarks/Notes):
 * - Removes emojis
 * - Removes leading whitespace
 * - Collapses consecutive horizontal spaces to a single space
 * - Collapses 3+ newlines to max 2 newlines
 */
export function normalizeLiveMultilineInput(text?: string | null): string {
  if (!text || typeof text !== "string") return "";
  let val = removeEmoji(text);
  // Remove leading whitespace
  val = val.replace(/^[\s\uFEFF\xA0]+/, "");
  // Collapse consecutive horizontal spaces
  val = val.replace(/[^\S\r\n]{2,}/g, " ");
  // Collapse excessive blank lines
  val = val.replace(/\n{3,}/g, "\n\n");
  return val;
}

/**
 * Trims input value on blur, review, or submit:
 * - Strips leading & trailing whitespace
 * - Collapses any remaining consecutive spaces into a single space
 */
export function finalizeTrim(text?: string | null): string {
  if (!text || typeof text !== "string") return "";
  const cleaned = removeEmoji(text).trim();
  return cleaned.replace(/\s{2,}/g, " ");
}

/**
 * Normalizes person names (e.g. Signatory Name):
 * - Disallows numbers
 * - Allows alphabetic characters, unicode letters, combining marks, approved punctuation (. ' ’ -)
 * - Single space between words, no leading spaces, collapses consecutive spaces
 */
export function normalizePersonName(text?: string | null): string {
  if (!text || typeof text !== "string") return "";
  let val = normalizeLiveInput(text);
  // Remove numbers and unapproved characters
  val = val.replace(/[0-9\p{N}]/gu, "");
  // Only allow unicode letters, marks, and . ' ’ - and space
  val = val.replace(/[^\p{L}\p{M}\u200C\u200D\s.'’\-]/gu, "");
  return val.replace(/ {2,}/g, " ");
}

/**
 * Normalizes business & company names (Legal Name, Trade Name):
 * - Allows letters, numbers, and legitimate punctuation: & . - ' ’ ( ) , /
 * - Single space between words, collapses consecutive spaces, removes leading spaces
 */
export function normalizeBusinessName(text?: string | null): string {
  if (!text || typeof text !== "string") return "";
  let val = normalizeLiveInput(text);
  // Filter out disallowed punctuation, allowing & . - ' ’ ( ) , / and alphanumeric
  val = val.replace(/[^\p{L}\p{M}\p{N}\s.,&'’()\/\-]/gu, "");
  return val.replace(/ {2,}/g, " ");
}

/**
 * Normalizes bank and branch names:
 * - Allows alphabetic letters, numbers, & . - ' ’ ( ) , /
 * - Single space between words, collapses consecutive spaces, removes leading spaces
 */
export function normalizeBankName(text?: string | null): string {
  if (!text || typeof text !== "string") return "";
  let val = normalizeLiveInput(text);
  val = val.replace(/[^\p{L}\p{M}\p{N}\s.,&'’()\/\-]/gu, "");
  return val.replace(/ {2,}/g, " ");
}

/**
 * Normalizes address fields:
 * - Allows letters, numbers, commas, hyphens, slashes, apostrophes, hashes, dots, colons, ampersands, parentheses
 * - Single space between words, collapses consecutive spaces, removes leading spaces
 */
export function normalizeAddress(text?: string | null): string {
  if (!text || typeof text !== "string") return "";
  let val = normalizeLiveInput(text);
  val = val.replace(/[^\p{L}\p{M}\p{N}\s.,\/\-'’()#:–—&]/gu, "");
  return val.replace(/ {2,}/g, " ");
}

/**
 * Normalizes alphabetic location fields (City, District):
 * - Strict alphabetic (letters, combining marks, ZWJ/ZWNJ)
 * - Disallows numbers and punctuation
 * - Single space between words, no leading spaces
 */
export function normalizeAlphabeticLocation(text?: string | null): string {
  if (!text || typeof text !== "string") return "";
  let val = normalizeLiveInput(text);
  val = val.replace(/[0-9\p{N}]/gu, "");
  val = val.replace(/[^\p{L}\p{M}\u200C\u200D\s]/gu, "");
  return val.replace(/ {2,}/g, " ");
}

/**
 * Normalizes structured identifiers (PAN, GSTIN, IFSC, ARN, etc.):
 * - Disallows ALL spaces and whitespace
 * - Converts to uppercase
 * - Strips non-alphanumeric characters (or permits / - if specified)
 */
export function normalizeStructuredCode(text?: string | null, allowPunctuation = false): string {
  if (!text || typeof text !== "string") return "";
  let val = removeEmoji(text).replace(/\s+/g, "").toUpperCase();
  if (allowPunctuation) {
    val = val.replace(/[^A-Z0-9\/-]/g, "");
  } else {
    val = val.replace(/[^A-Z0-9]/g, "");
  }
  return val;
}

/**
 * Checks if a string contains only spaces or is empty after trimming
 */
export function isOnlySpacesOrEmpty(text?: string | null): boolean {
  if (!text || typeof text !== "string") return true;
  return text.trim().length === 0;
}

/**
 * Normalizes email address input:
 * - Disallows all whitespace and emojis
 * - Converts to lowercase
 * - Strips characters not allowed in valid email addresses: only a-z, 0-9, ., _, -, +, @
 */
export function normalizeEmail(text?: string | null): string {
  if (!text || typeof text !== "string") return "";
  const cleaned = removeEmoji(text).replace(/\s+/g, "").toLowerCase();
  return cleaned.replace(/[^a-z0-9._\-+@]/g, "");
}

/**
 * Normalizes digits-only input (Mobile, PIN, Bank Account, HSN, etc.):
 * - Disallows all whitespace and emojis
 * - Strips any non-digit character
 */
export function normalizeDigits(text?: string | null, maxLength?: number): string {
  if (!text || typeof text !== "string") return "";
  const digits = removeEmoji(text).replace(/\D/g, "");
  return typeof maxLength === "number" && maxLength > 0 ? digits.slice(0, maxLength) : digits;
}

/**
 * Normalizes monetary amount input (e.g. ₹ figures):
 * - Disallows emojis and whitespace
 * - Keeps digits and at most one decimal point (up to maxDecimals)
 */
export function normalizeMonetaryAmount(text?: string | null, maxDecimals = 2): string {
  if (!text || typeof text !== "string") return "";
  const cleaned = removeEmoji(text).replace(/[^\d.]/g, "");
  const firstDot = cleaned.indexOf(".");
  if (firstDot === -1) return cleaned;
  if (maxDecimals <= 0) return cleaned.slice(0, firstDot);
  const intPart = cleaned.slice(0, firstDot);
  const fracPart = cleaned.slice(firstDot + 1).replace(/\./g, "").slice(0, maxDecimals);
  return `${intPart}.${fracPart}`;
}

/**
 * Normalizes general multiline remarks and text:
 * - Removes emojis and control characters
 * - Allows alphanumeric, standard punctuation, and normal spaces/newlines
 */
export function normalizeRemarksText(text?: string | null): string {
  if (!text || typeof text !== "string") return "";
  let val = normalizeLiveMultilineInput(text);
  val = val.replace(/[^\p{L}\p{M}\p{N}\s.,\/\-'’()#:–—&!?%₹$*+;=@"\n\r]/gu, "");
  return val;
}

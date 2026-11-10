import { isIanaDelegatedTld } from "./ianaTldData";

/**
 * RFC 5322-compliant local part pattern (no spaces, no consecutive dots, max 64 chars).
 */
const EMAIL_LOCAL_REGEX = /^[a-zA-Z0-9]+(?:[._+-][a-zA-Z0-9]+)*$/;

/**
 * Domain label pattern: 1-63 alphanumeric chars or internal hyphens.
 */
const DOMAIN_LABEL_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;

/**
 * Strict email validation for GST Registration & Compliance modules.
 * Ensures:
 * 1. Single '@' separating local part and domain.
 * 2. Local part: <= 64 chars, no spaces, no consecutive/leading/trailing dots (RFC 5322).
 * 3. Domain: <= 253 chars, at least one dot, valid DNS labels (1-63 chars, alphanumeric with internal hyphens).
 * 4. TLD: Must be an active delegated Top-Level Domain in the official IANA Root Zone Database.
 */
export function isValidGstEmail(raw?: string | null): boolean {
  if (!raw) return false;
  const email = raw.trim();
  if (!email || email.length > 150 || /\s/.test(email)) return false;
  const atIndex = email.indexOf("@");
  if (atIndex === -1 || atIndex !== email.lastIndexOf("@")) return false;
  const local = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);
  if (!local || local.length > 64 || local.startsWith(".") || local.endsWith(".") || !EMAIL_LOCAL_REGEX.test(local)) return false;
  if (!domain || domain.length > 253 || domain.startsWith(".") || domain.endsWith(".")) return false;
  const labels = domain.split(".");
  if (labels.length < 2) return false;
  const allLabelsValid = labels.every((l) => l.length >= 1 && l.length <= 63 && DOMAIN_LABEL_REGEX.test(l));
  if (!allLabelsValid) return false;
  return isIanaDelegatedTld(labels[labels.length - 1].toLowerCase());
}

/**
 * Strict validator for email addresses in the GST Amendment module.
 * Rejects invalid domain endings, typos appended to .com (e.g. .comjdjdidi, .comm),
 * invalid TLDs, consecutive dots, spaces, and numbers in the top-level domain.
 */
export function validateAmendmentEmail(raw: string): boolean {
  const email = (raw || "").trim();
  if (!email || email.length > 100) return false;
  if (/\s/.test(email)) return false;

  const atIndex = email.indexOf("@");
  if (atIndex === -1 || atIndex !== email.lastIndexOf("@")) return false;

  const localPart = email.slice(0, atIndex);
  const domainPart = email.slice(atIndex + 1);

  if (!localPart || !domainPart) return false;
  if (localPart.length > 64) return false;

  // Local part cannot start/end with dot or contain consecutive dots
  if (localPart.startsWith(".") || localPart.endsWith(".") || localPart.includes("..")) {
    return false;
  }
  if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(localPart)) {
    return false;
  }

  // Domain cannot start/end with dot or hyphen or contain consecutive dots
  if (domainPart.startsWith(".") || domainPart.endsWith(".") || domainPart.includes("..")) {
    return false;
  }
  if (domainPart.startsWith("-") || domainPart.endsWith("-")) {
    return false;
  }

  const domainLabels = domainPart.split(".");
  if (domainLabels.length < 2) return false;

  const allLabelsValid = domainLabels.every(
    (label) => label && label.length <= 63 && /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/.test(label)
  );
  if (!allLabelsValid) return false;

  // Top-Level Domain (TLD) is the final segment
  const tld = domainLabels[domainLabels.length - 1].toLowerCase();

  // TLD must consist strictly of letters (no digits or symbols) between 2 and 10 characters
  if (!/^[a-zA-Z]{2,10}$/.test(tld)) {
    return false;
  }

  // Reject accidental typo extensions starting with "com" followed by extra characters (e.g. "comjdjdidi", "comm", "comxyz")
  if (/^com[a-z]+/i.test(tld)) {
    return false;
  }

  // Reject typo extensions on other common TLDs (e.g. "orgxyz", "netxyz", "inxyz", "eduxyz")
  if (/^(?:org|net|gov|edu|biz|info|mil)[a-z]+/i.test(tld)) {
    return false;
  }

  // If domain is a well-known email provider, validate that provider's domain structure
  const provider = domainLabels[domainLabels.length - 2].toLowerCase();
  if (["gmail", "hotmail", "outlook", "icloud"].includes(provider)) {
    if (tld !== "com" || domainLabels.length !== 2) {
      return false;
    }
  }

  return true;
}

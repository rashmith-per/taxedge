/**
 * Centralized Date of Birth (DOB) and Age Validation for GST Modules.
 *
 * Rules:
 * - Empty DOB: "Please enter your Date of Birth."
 * - Invalid date: "Please enter a valid Date of Birth."
 * - Future date: "Date of Birth cannot be in the future."
 * - Minimum 18 years: "You must be at least 18 years old to proceed."
 * - Exact 18th birthday is accepted.
 * - Dynamic age calculation using current device date.
 * - Handles leap years correctly (e.g., Feb 29).
 */

export const DOB_ERROR_MESSAGES = {
  EMPTY: "Please enter your Date of Birth.",
  INVALID: "Please enter a valid Date of Birth.",
  FUTURE: "Date of Birth cannot be in the future.",
  UNDERAGE: "You must be at least 18 years old to proceed.",
} as const;

export const MIN_GST_AGE = 18;

/**
 * Parses date string in DD-MM-YYYY, DD/MM/YYYY, or YYYY-MM-DD format.
 * Returns null if the date is invalid or impossible (e.g. 31-02-2020).
 */
export function parseDobDate(raw?: string | null): Date | null {
  if (!raw) return null;
  const clean = raw.trim();
  if (!clean) return null;

  const ddmmyyyy = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/.exec(clean);
  const yyyymmdd = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:T.*)?$/.exec(clean);

  const [y, m, d] = ddmmyyyy
    ? [Number(ddmmyyyy[3]), Number(ddmmyyyy[2]) - 1, Number(ddmmyyyy[1])]
    : yyyymmdd
    ? [Number(yyyymmdd[1]), Number(yyyymmdd[2]) - 1, Number(yyyymmdd[3])]
    : [];

  if (y === undefined || m === undefined || d === undefined) return null;

  const dt = new Date(y, m, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m || dt.getDate() !== d) {
    return null;
  }
  return dt;
}

/**
 * Calculates completed full years of age based on exact day, month, and year.
 * Handles leap year birthdays correctly.
 */
export function calculateAge(dob: Date, referenceDate: Date = new Date()): number {
  let age = referenceDate.getFullYear() - dob.getFullYear();
  const currentMonth = referenceDate.getMonth();
  const dobMonth = dob.getMonth();

  if (
    currentMonth < dobMonth ||
    (currentMonth === dobMonth && referenceDate.getDate() < dob.getDate())
  ) {
    age -= 1;
  }
  return age;
}

/**
 * Returns the maximum Date allowed for an 18-year-old applicant today.
 */
export function getMaxDobForEighteen(referenceDate: Date = new Date()): Date {
  const d = new Date(referenceDate.getFullYear() - MIN_GST_AGE, referenceDate.getMonth(), referenceDate.getDate());
  return d;
}

/**
 * Validates Date of Birth for GST modules according to 18+ age criteria.
 * Returns an error string if invalid, or empty string "" if valid.
 */
export function validateGstDob(
  value?: string | null,
  referenceDate: Date = new Date()
): string {
  const raw = value !== null && value !== undefined ? String(value).trim() : "";
  if (!raw) {
    return DOB_ERROR_MESSAGES.EMPTY;
  }

  const dobDate = parseDobDate(raw);
  if (!dobDate) {
    return DOB_ERROR_MESSAGES.INVALID;
  }

  // Check reasonable past year (e.g. over 120 years ago)
  if (dobDate.getFullYear() < referenceDate.getFullYear() - 120) {
    return DOB_ERROR_MESSAGES.INVALID;
  }

  // Create clean date-only instances for comparison
  const todayOnly = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate()
  );
  const dobOnly = new Date(
    dobDate.getFullYear(),
    dobDate.getMonth(),
    dobDate.getDate()
  );

  if (dobOnly.getTime() > todayOnly.getTime()) {
    return DOB_ERROR_MESSAGES.FUTURE;
  }

  const age = calculateAge(dobOnly, todayOnly);
  if (age < MIN_GST_AGE) {
    return DOB_ERROR_MESSAGES.UNDERAGE;
  }

  return "";
}

/**
 * Boolean helper that returns true if the DOB is valid and age is at least 18.
 */
export function isGstDobValid(
  value?: string | null,
  referenceDate: Date = new Date()
): boolean {
  return validateGstDob(value, referenceDate) === "";
}

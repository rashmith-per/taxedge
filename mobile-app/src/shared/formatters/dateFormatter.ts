export function formatDate(dateString: string): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

// ─── DD-MM-YYYY manual date entry (shared by all date inputs) ───────────────

export const DDMMYYYY_PATTERN = /^(\d{2})-(\d{2})-(\d{4})$/;
export const MIN_SUPPORTED_YEAR = 1900;
export const MAX_SUPPORTED_YEAR = 2100;

/**
 * Masks free typing into DD-MM-YYYY. Only digits are kept and the dashes are
 * inserted automatically. A dash is only added once a following digit exists,
 * so backspace never gets "stuck" on a separator.
 */
export function maskDateInput(text: string): string {
  const digits = (text || "").replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
}

/**
 * Parses a DD-MM-YYYY string into a local Date. Returns null unless the value
 * is a real calendar date (e.g. 31-02-2024 and 29-02-2023 are rejected).
 */
export function parseDDMMYYYY(value?: string | null): Date | null {
  const match = DDMMYYYY_PATTERN.exec((value || "").trim());
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (year < MIN_SUPPORTED_YEAR || year > MAX_SUPPORTED_YEAR) return null;
  if (month < 1 || month > 12) return null;
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

export function isValidDDMMYYYY(value?: string | null): boolean {
  return parseDDMMYYYY(value) !== null;
}

/** Formats a Date as DD-MM-YYYY (the format stored by DD-MM-YYYY forms). */
export function formatDateDDMMYYYY(date: Date): string {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${d}-${m}-${date.getFullYear()}`;
}

/** True when the date is after today (time of day ignored). */
export function isFutureDate(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compare = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return compare.getTime() > today.getTime();
}

// ─── Timestamps & relative time (notifications, activity feeds) ─────────────

/**
 * Parses a stored/server timestamp into a Date, without guessing a value:
 *  - Date instances
 *  - ISO 8601 strings ("2026-09-25T06:30:00.000Z", with or without offset)
 *  - Unix epoch numbers or numeric strings: values below 1e12 are seconds,
 *    otherwise milliseconds (1e12 ms is Sep 2001, 1e12 s is year 33658)
 * Returns null for missing or invalid input. It never substitutes "now".
 */
export function parseTimestamp(value: unknown): Date | null {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;

  let epoch: number | null = null;
  if (typeof value === "number") epoch = value;
  else if (typeof value === "string" && /^\d+(\.\d+)?$/.test(value.trim())) epoch = Number(value.trim());

  if (epoch !== null) {
    if (!Number.isFinite(epoch) || epoch <= 0) return null;
    const date = new Date(epoch < 1e12 ? epoch * 1000 : epoch);
    return isNaN(date.getTime()) ? null : date;
  }

  if (typeof value === "string") {
    const date = new Date(value.trim());
    return isNaN(date.getTime()) ? null : date;
  }
  return null;
}

const isSameCalendarDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/**
 * Human-readable age of a timestamp, shown in the device's local time zone:
 *   < 1 minute          -> "Just now"
 *   < 1 hour            -> "5 min ago"
 *   earlier today       -> "2 hr ago"
 *   previous day        -> "Yesterday"
 *   older               -> "12 Sept 2026, 10:15 am" (formatDateTime)
 * Missing/invalid input -> "Date unavailable" (never pretends to be recent).
 */
export function formatRelativeTime(value: unknown, now: Date = new Date()): string {
  const date = parseTimestamp(value);
  if (!date) return "Date unavailable";

  const diffMs = now.getTime() - date.getTime();
  // Allow a little clock skew; anything clearly in the future shows its date.
  if (diffMs < -60_000) return formatDateTime(date.toISOString());
  if (diffMs < 60_000) return "Just now";

  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) return `${minutes} min ago`;

  if (isSameCalendarDay(date, now)) return `${Math.floor(minutes / 60)} hr ago`;

  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  if (isSameCalendarDay(date, yesterday)) return "Yesterday";

  return formatDateTime(date.toISOString());
}

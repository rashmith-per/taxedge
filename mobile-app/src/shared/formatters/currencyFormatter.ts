/**
 * Indian number / currency formatting (lakh-crore grouping: 42,58,088).
 *
 * Display strings only. API payloads must use raw numbers (or the raw numeric
 * strings produced by `toRawNumericString`), never these formatted values.
 *
 * Grouping is done in plain JS instead of `Intl`/`toLocaleString("en-IN")` so
 * the output is identical on every Android/iOS JS engine configuration.
 */

const RUPEE = "₹";

/** Groups an integer digit string the Indian way: "4258088" -> "42,58,088". */
export function groupIndianDigits(intDigits: string): string {
  const digits = intDigits.replace(/^0+(?=\d)/, "");
  if (digits.length <= 3) return digits;
  const lastThree = digits.slice(-3);
  const rest = digits.slice(0, -3);
  return `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",")},${lastThree}`;
}

const toNumber = (amount: number | string | null | undefined): number => {
  if (typeof amount === "number") return amount;
  if (amount == null) return NaN;
  const cleaned = String(amount).replace(/,/g, "").trim();
  return cleaned === "" ? NaN : parseFloat(cleaned);
};

/**
 * Formats a number with Indian grouping.
 * @param maxDecimals maximum fraction digits kept (trailing zeros removed).
 */
export function formatIndianNumber(
  amount: number | string | null | undefined,
  maxDecimals: number = 2
): string {
  const num = toNumber(amount);
  if (!Number.isFinite(num)) return "0";
  const negative = num < 0;
  const fixed = Math.abs(num).toFixed(Math.max(0, maxDecimals));
  const [intPart, fracPart = ""] = fixed.split(".");
  const trimmedFrac = fracPart.replace(/0+$/, "");
  const grouped = groupIndianDigits(intPart);
  const isZero = grouped === "0" && trimmedFrac === "";
  return `${negative && !isZero ? "-" : ""}${grouped}${trimmedFrac ? `.${trimmedFrac}` : ""}`;
}

/** "₹42,58,088" style currency display. Rounds to `maxDecimals` (default 0). */
export function formatIndianCurrency(
  amount: number | string | null | undefined,
  maxDecimals: number = 0
): string {
  const formatted = formatIndianNumber(amount, maxDecimals);
  return formatted.startsWith("-") ? `-${RUPEE}${formatted.slice(1)}` : `${RUPEE}${formatted}`;
}

/** Existing API: whole-rupee currency, e.g. 4258088 -> "₹42,58,088". */
export function formatCurrencyINR(amount: number | string): string {
  const num = toNumber(amount);
  if (!Number.isFinite(num)) return `${RUPEE}0`;
  return formatIndianCurrency(num, 0);
}

export const formatCurrency = formatCurrencyINR;

/** Existing API: plain number with Indian grouping (up to 3 decimals). */
export function formatNumberINR(amount: number | string): string {
  const num = toNumber(amount);
  if (!Number.isFinite(num)) return "0";
  return formatIndianNumber(num, 3);
}

// ─── Text-input helpers (display vs raw value) ──────────────────────────────

/**
 * Converts user-typed text into the raw numeric string stored in form state
 * and sent to the API: digits plus at most one decimal point, no commas.
 * "42,58,088" -> "4258088", "1,234.50" -> "1234.50".
 */
export function toRawNumericString(text: string | number | null | undefined, maxDecimals: number = 2): string {
  const value = String(text ?? "").replace(/[^\d.]/g, "");
  const firstDot = value.indexOf(".");
  if (firstDot === -1 || maxDecimals <= 0) return value.replace(/\./g, "");
  const intPart = value.slice(0, firstDot);
  const fracPart = value.slice(firstDot + 1).replace(/\./g, "").slice(0, maxDecimals);
  return `${intPart}.${fracPart}`;
}

/**
 * Formats a raw numeric string for display inside a TextInput while typing.
 * Keeps what the user typed after the decimal point (including a trailing
 * "."), so editing is never disrupted: "4258088" -> "42,58,088".
 */
export function formatIndianNumberInput(text: string | number | null | undefined, maxDecimals: number = 2): string {
  const raw = toRawNumericString(text, maxDecimals);
  if (raw === "") return "";
  const [intPart, fracPart] = raw.split(".");
  const groupedInt = intPart === "" ? "0" : groupIndianDigits(intPart);
  return fracPart !== undefined ? `${groupedInt}.${fracPart}` : groupedInt;
}

/** Parses formatted or raw text into a number (NaN when empty/invalid). */
export function parseIndianNumber(text: string | number | null | undefined): number {
  if (typeof text === "number") return text;
  const raw = toRawNumericString(text, 20);
  return raw === "" || raw === "." ? NaN : parseFloat(raw);
}

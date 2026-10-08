import { useCallback, useRef, useState } from "react";
import { ifscService, type IfscDetails } from "@/shared/services/lookup/ifscService";

/**
 * When a typed IFSC triggers a lookup — the two behaviours the loan banking steps use today:
 * - "validFormat" (Personal Loan): only codes passing `ifscService.isValidFormat`; others clear silently.
 * - "length" (Machinery Loan, Working Capital): every 11-character code; the service reports a bad format.
 */
export type IfscLookupTrigger = "validFormat" | "length";

export interface UseIfscLookupOptions {
  trigger?: IfscLookupTrigger;
  /** Fixed message for every failed lookup. Defaults to the service's message, then "Invalid IFSC Code". */
  errorMessage?: string;
  /** Called with the bank details of a successful lookup, e.g. to fill the bank name field. */
  onResolved?: (details: IfscDetails) => void;
}

export interface IfscLookup {
  bankName: string;
  branchName: string;
  details: IfscDetails | null;
  isVerified: boolean;
  isLoading: boolean;
  error: string | null;
  /** Looks up an IFSC directly. Resolves the details, or `null` on failure or when superseded. */
  lookup: (ifsc: string) => Promise<IfscDetails | null>;
  /** For `onChangeText`: normalises the input, looks it up when complete, returns the cleaned code to store. */
  handleIfscChange: (text: string) => string;
  reset: () => void;
}

const IFSC_LENGTH = 11;

export const normalizeIfscInput = (text: string): string => text.toUpperCase().replace(/[^A-Z0-9]/g, "");

/** IFSC → bank/branch lookup state on top of the shared `ifscService` (no debounce, as today). */
export function useIfscLookup({
  trigger = "validFormat",
  errorMessage,
  onResolved,
}: UseIfscLookupOptions = {}): IfscLookup {
  const [details, setDetails] = useState<IfscDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Only the newest request may update state, so a slow earlier response cannot win.
  const latestRequest = useRef(0);

  const reset = useCallback(() => {
    latestRequest.current += 1;
    setDetails(null);
    setIsLoading(false);
    setError(null);
  }, []);

  const lookup = useCallback(
    async (ifsc: string): Promise<IfscDetails | null> => {
      const requestId = ++latestRequest.current;
      setDetails(null);
      setError(null);
      setIsLoading(true);
      try {
        const result = await ifscService.lookup(ifsc);
        if (requestId !== latestRequest.current) return null;
        setDetails(result);
        onResolved?.(result);
        return result;
      } catch (err) {
        if (requestId !== latestRequest.current) return null;
        const serviceMessage = err instanceof Error ? err.message : "";
        setError(errorMessage ?? (serviceMessage || "Invalid IFSC Code"));
        return null;
      } finally {
        if (requestId === latestRequest.current) setIsLoading(false);
      }
    },
    [errorMessage, onResolved]
  );

  const handleIfscChange = useCallback(
    (text: string): string => {
      const cleaned = normalizeIfscInput(text);
      const shouldLookup =
        trigger === "length" ? cleaned.length === IFSC_LENGTH : ifscService.isValidFormat(cleaned);

      if (shouldLookup) {
        lookup(cleaned);
      } else {
        reset();
      }
      return cleaned;
    },
    [trigger, lookup, reset]
  );

  return {
    bankName: details?.bank ?? "",
    branchName: details?.branch ?? "",
    details,
    isVerified: details !== null,
    isLoading,
    error,
    lookup,
    handleIfscChange,
    reset,
  };
}

export default useIfscLookup;

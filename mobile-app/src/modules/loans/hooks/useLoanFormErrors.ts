import { useState } from "react";

export interface LoanFormErrors {
  /** Field-keyed validation messages for the active step. */
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  /** Removes one field's message once the user edits that field. */
  clearFieldError: (field: string) => void;
}

/**
 * Validation-message state shared by the loan application screens.
 * Which fields are validated, and when, stays with each screen.
 */
export function useLoanFormErrors(): LoanFormErrors {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearFieldError = (field: string) => {
    if (!errors[field]) return;
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  return { errors, setErrors, clearFieldError };
}

export default useLoanFormErrors;

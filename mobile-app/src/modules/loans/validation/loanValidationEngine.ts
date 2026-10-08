import {
  validatePan,
  validatePhone,
  validateEmail,
  validateIfsc,
  validateGstin,
  validateDateOfBirth,
  validatePincode,
  validateFullName,
} from "../../../shared/validators/indianTaxValidators";
import { ifscService } from "@/shared/services/lookup/ifscService";

export type FieldValidator<T = any> = (
  value: any,
  formValues: T,
  field: string
) => string | null;

export type ValidationSchema<T = any> = {
  [K in keyof T]?: FieldValidator<T> | FieldValidator<T>[];
};

/**
 * Common, pure validation helpers adhering to Indian financial & tax data rules.
 */
export const validators = {
  /** Text field: mandatory, non-empty, whitespace-trimmed, with min/max length checks */
  requiredText: (
    fieldName: string,
    options?: { min?: number; max?: number; message?: string }
  ): FieldValidator => {
    return (val) => {
      const str = typeof val === "string" ? val.trim() : "";
      if (!str) {
        return options?.message ?? `${fieldName} is required`;
      }
      if (options?.min && str.length < options.min) {
        return `${fieldName} must be at least ${options.min} characters`;
      }
      if (options?.max && str.length > options.max) {
        return `${fieldName} must not exceed ${options.max} characters`;
      }
      return null;
    };
  },

  /** Optional text field with max length check if provided */
  optionalText: (
    fieldName: string,
    options?: { max?: number }
  ): FieldValidator => {
    return (val) => {
      const str = typeof val === "string" ? val.trim() : "";
      if (!str) return null;
      if (options?.max && str.length > options.max) {
        return `${fieldName} must not exceed ${options.max} characters`;
      }
      return null;
    };
  },

  /** Required person name (alphabetic + spaces/hyphens, minimum 2 characters) */
  requiredName: (fieldName = "Full name"): FieldValidator => {
    return (val) => {
      const str = typeof val === "string" ? val.trim() : "";
      if (!str) return `${fieldName} is required`;
      if (!validateFullName(str)) {
        return `Enter a valid ${fieldName.toLowerCase()} (letters only)`;
      }
      return null;
    };
  },

  /** Required numeric amount: positive number, min/max limits */
  requiredAmount: (
    fieldName = "Amount",
    options?: { min?: number; max?: number; message?: string }
  ): FieldValidator => {
    return (val) => {
      if (val === undefined || val === null || val === "") {
        return options?.message ?? `${fieldName} is required`;
      }
      const clean = String(val).replace(/[^0-9.]/g, "");
      const num = Number(clean);
      if (isNaN(num) || num <= 0) {
        return options?.message ?? `Enter a valid positive ${fieldName.toLowerCase()}`;
      }
      if (options?.min !== undefined && num < options.min) {
        return `${fieldName} must be at least ₹${options.min.toLocaleString("en-IN")}`;
      }
      if (options?.max !== undefined && num > options.max) {
        return `${fieldName} cannot exceed ₹${options.max.toLocaleString("en-IN")}`;
      }
      return null;
    };
  },

  /** Optional numeric amount (validates number if provided) */
  optionalAmount: (
    fieldName = "Amount",
    options?: { min?: number; max?: number }
  ): FieldValidator => {
    return (val) => {
      if (val === undefined || val === null || val === "") return null;
      const clean = String(val).replace(/[^0-9.]/g, "");
      const num = Number(clean);
      if (isNaN(num) || num < 0) {
        return `Enter a valid ${fieldName.toLowerCase()}`;
      }
      if (options?.min !== undefined && num < options.min) {
        return `${fieldName} must be at least ₹${options.min.toLocaleString("en-IN")}`;
      }
      if (options?.max !== undefined && num > options.max) {
        return `${fieldName} cannot exceed ₹${options.max.toLocaleString("en-IN")}`;
      }
      return null;
    };
  },

  /** Dropdown / Chip / Radio selection from allowed options */
  oneOf: (
    allowed: readonly string[],
    fieldName: string,
    message?: string
  ): FieldValidator => {
    return (val) => {
      if (!val || typeof val !== "string" || !val.trim()) {
        return message ?? `Please select a valid ${fieldName.toLowerCase()}`;
      }
      if (!allowed.includes(val.trim())) {
        return message ?? `Please select a valid ${fieldName.toLowerCase()}`;
      }
      return null;
    };
  },

  /** Indian Mobile number: 10 digits starting with 6-9 */
  phone: (fieldName = "Mobile number"): FieldValidator => {
    return (val) => {
      const str = typeof val === "string" ? val.trim() : "";
      if (!str) return `${fieldName} is required`;
      if (!validatePhone(str)) {
        return "Enter a valid 10-digit mobile number starting with 6-9";
      }
      return null;
    };
  },

  /** Email address */
  email: (options?: { required?: boolean; fieldName?: string }): FieldValidator => {
    const fieldName = options?.fieldName ?? "Email address";
    return (val) => {
      const str = typeof val === "string" ? val.trim() : "";
      if (!str) {
        return options?.required ? `${fieldName} is required` : null;
      }
      if (!validateEmail(str)) {
        return "Enter a valid email address (e.g. name@domain.com)";
      }
      return null;
    };
  },

  /** Indian PAN: 10 characters (5 letters + 4 digits + 1 letter) */
  pan: (fieldName = "PAN"): FieldValidator => {
    return (val) => {
      const str = typeof val === "string" ? val.trim().toUpperCase() : "";
      if (!str) return `${fieldName} is required`;
      if (!validatePan(str)) {
        return "Enter a valid 10-character PAN (e.g. ABCDE1234F)";
      }
      return null;
    };
  },

  /** Indian Bank IFSC: 11 characters (4 letters + 0 + 6 alphanumeric) */
  ifsc: (fieldName = "IFSC code"): FieldValidator => {
    return (val) => {
      const str = typeof val === "string" ? val.trim().toUpperCase() : "";
      if (!str) return `${fieldName} is required`;
      if (!validateIfsc(str) || !ifscService.isValidFormat(str)) {
        return "Valid 11-character IFSC code is required (e.g. SBIN0001234)";
      }
      return null;
    };
  },

  /** Bank account number: 9 to 18 numeric digits */
  accountNumber: (fieldName = "Bank account number"): FieldValidator => {
    return (val) => {
      const str = typeof val === "string" ? val.trim() : "";
      if (!str) return `${fieldName} is required`;
      if (!/^\d{9,18}$/.test(str)) {
        return "Enter a valid bank account number (9 to 18 digits)";
      }
      return null;
    };
  },

  /** PIN code: 6 numeric digits starting with 1-9 */
  pincode: (fieldName = "PIN code"): FieldValidator => {
    return (val) => {
      const str = typeof val === "string" ? val.trim() : "";
      if (!str) return `${fieldName} is required`;
      if (!validatePincode(str)) {
        return "Enter a valid 6-digit PIN code";
      }
      return null;
    };
  },

  /** GSTIN: 15 characters */
  gstin: (options?: { required?: boolean }): FieldValidator => {
    return (val) => {
      const str = typeof val === "string" ? val.trim().toUpperCase() : "";
      if (!str) {
        return options?.required ? "GSTIN is required" : null;
      }
      if (!validateGstin(str)) {
        return "Enter a valid 15-character GSTIN (e.g. 29ABCDE1234F1Z5)";
      }
      return null;
    };
  },

  /** Udyam Registration: UDYAM-XX-00-0000000 */
  udyam: (options?: { required?: boolean }): FieldValidator => {
    const regex = /^UDYAM-[A-Z]{2}-[0-9]{2}-[0-9]{7}$/i;
    return (val) => {
      const str = typeof val === "string" ? val.trim().toUpperCase() : "";
      if (!str) {
        return options?.required ? "Udyam registration number is required" : null;
      }
      if (!regex.test(str)) {
        return "Enter valid Udyam format: UDYAM-XX-00-0000000";
      }
      return null;
    };
  },

  /** Date of Birth / Date validation */
  dateOfBirth: (fieldName = "Date of birth"): FieldValidator => {
    return (val) => {
      const str = typeof val === "string" ? val.trim() : "";
      if (!str) return `${fieldName} is required`;
      if (!validateDateOfBirth(str)) {
        return "Enter a valid calendar date (DD-MM-YYYY) not in the future";
      }
      return null;
    };
  },

  /** Mandatory boolean toggle (must be true) */
  booleanRequired: (message: string): FieldValidator => {
    return (val) => {
      return val === true ? null : message;
    };
  },

  /** Vehicle Registration number (e.g. MH01AB1234 or DL1CA1234) */
  vehicleRegistration: (fieldName = "Vehicle registration number"): FieldValidator => {
    const regRegex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4}$/i;
    return (val) => {
      const str = typeof val === "string" ? val.trim().replace(/[-\s]/g, "").toUpperCase() : "";
      if (!str) return `${fieldName} is required`;
      if (!regRegex.test(str)) {
        return "Enter a valid vehicle registration number (e.g. MH01AB1234)";
      }
      return null;
    };
  },

  /** Custom validator */
  custom: (fn: (val: any, formValues: any, field: string) => string | null): FieldValidator => {
    return fn;
  },
};

/**
 * Validates form values against a typed validation schema.
 * Returns a dictionary of field names to error messages.
 */
export function validateForm<T extends Record<string, any>>(
  values: T,
  schema: ValidationSchema<T>
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const field in schema) {
    const ruleOrRules = schema[field];
    if (!ruleOrRules) continue;

    const val = values[field];
    const rules = Array.isArray(ruleOrRules) ? ruleOrRules : [ruleOrRules];

    for (const rule of rules) {
      const errorMsg = rule(val, values, field);
      if (errorMsg) {
        errors[field] = errorMsg;
        break; // First error per field wins
      }
    }
  }

  return errors;
}

// ─────────────────────────────────────────────────────────────────────────────
// LOAN SPECIFIC SCHEMAS (PHASE 2)
// ─────────────────────────────────────────────────────────────────────────────

export const PERSONAL_LOAN_ALLOWED_TENURES = ["3", "6", "12", "24", "36", "48", "60"] as const;

export const personalLoanSchemas = {
  financials: {
    requiredAmount: validators.requiredAmount("Required loan amount", { min: 10000, max: 50000000 }),
    purpose: validators.requiredText("Purpose of loan", { min: 3 }),
    preferredTenureMonths: validators.oneOf(
      PERSONAL_LOAN_ALLOWED_TENURES,
      "Preferred tenure",
      "Please select a preferred tenure (3 to 60 months)"
    ),
    monthlyIncomeOrTurnover: validators.requiredAmount("Monthly net in-hand salary", { min: 1000 }),
    existingEmi: validators.custom((val, all) => {
      if (all.hasExistingLoans) {
        return validators.requiredAmount("Current monthly EMI", { min: 1 })(val, all, "existingEmi");
      }
      return null;
    }),
  },
  banking: {
    ifscCode: validators.ifsc("Bank IFSC code"),
    primaryBankName: validators.requiredText("Primary bank name", { min: 2 }),
    accountNumber: validators.accountNumber("Bank account number"),
  },
};

export const businessLoanSchemas = {
  financials: {
    requiredAmount: validators.requiredAmount("Required loan amount", { min: 50000, max: 200000000 }),
    purpose: validators.requiredText("Purpose of loan", { min: 3 }),
    preferredTenureMonths: validators.requiredText("Preferred tenure"),
    existingEmi: validators.custom((val, all) => {
      if (all.hasExistingLoans) {
        return validators.requiredAmount("Total monthly EMI", { min: 0 })(val, all, "existingEmi");
      }
      return null;
    }),
  },
  business: {
    businessName: validators.requiredText("Registered business name", { min: 2 }),
    businessConstitution: validators.requiredText("Business constitution / type"),
    gstin: validators.gstin({ required: true }),
    businessVintageYears: validators.requiredText("Business vintage"),
    annualTurnover: validators.requiredAmount("Annual turnover", { min: 10000 }),
    netProfit: validators.optionalAmount("Annual net profit", { min: 0 }),
    signatoryName: validators.requiredName("Authorized signatory name"),
    signatoryDesignation: validators.requiredText("Signatory designation", { min: 2 }),
    signatoryEmail: validators.email({ required: false }),
    udyamRegistration: validators.custom((val, all) => {
      if (all.hasUdyam) {
        return validators.udyam({ required: true })(val, all, "udyamRegistration");
      }
      return null;
    }),
  },
  banking: {
    ifscCode: validators.ifsc("Bank IFSC code"),
    primaryBankName: validators.requiredText("Primary operating bank name", { min: 2 }),
    accountNumber: validators.accountNumber("Current account number"),
    itrAckNumber: validators.custom((val) => {
      if (!val) return null;
      return /^\d{15}$/.test(String(val).trim())
        ? null
        : "ITR acknowledgement number must be 15 digits";
    }),
  },
};

export const homeLoanSchemas = {
  financials: {
    requiredAmount: validators.requiredAmount("Required loan amount", { min: 100000, max: 500000000 }),
    purpose: validators.requiredText("Property intent / purpose"),
    customPurpose: validators.custom((val, all) => {
      if (all.purpose === "Others" && (!val || !val.trim())) {
        return "Please specify your custom property purpose";
      }
      return null;
    }),
    preferredTenureMonths: validators.requiredText("Repayment tenure"),
    estimatedPropertyValue: validators.optionalAmount("Estimated property value", { min: 10000 }),
    existingEmi: validators.custom((val, all) => {
      if (all.hasExistingLoans) {
        return validators.requiredAmount("Ongoing monthly EMI", { min: 1 })(val, all, "existingEmi");
      }
      return null;
    }),
  },
  employment: {
    employmentType: validators.requiredText("Employment category"),
    monthlyIncomeOrTurnover: validators.requiredText("Monthly income / turnover"),
    businessName: validators.custom((val, all) => {
      if (all.employmentType === "Business Owner" || all.employmentType === "Self-Employed Professional") {
        return validators.requiredText("Business / firm name", { min: 2 })(val, all, "businessName");
      }
      return null;
    }),
  },
  banking: {
    ifscCode: validators.ifsc("Bank IFSC code"),
    primaryBankName: validators.requiredText("Primary bank name", { min: 2 }),
    accountNumber: validators.accountNumber("Bank account number"),
    itrFilingStatus: validators.requiredText("ITR filing status"),
    itrAckNumber: validators.custom((val, all) => {
      if (all.itrFilingStatus === "Filed" && val) {
        return /^\d{15}$/.test(String(val).trim())
          ? null
          : "ITR acknowledgement number must be 15 digits";
      }
      return null;
    }),
  },
};

export const vehicleLoanSchemas = {
  financials: {
    requiredAmount: validators.requiredAmount("Required loan amount", { min: 20000, max: 20000000 }),
    purpose: validators.requiredText("Vehicle category / purpose"),
    customPurpose: validators.custom((val, all) => {
      if (all.purpose === "Others" && (!val || !val.trim())) {
        return "Please specify custom vehicle requirement";
      }
      return null;
    }),
    preferredTenureMonths: validators.requiredText("Repayment tenure"),
    vehicleCondition: validators.requiredText("Vehicle condition"),
    vehicleMakeModel: validators.requiredText("Vehicle make and model", { min: 2 }),
    onRoadPrice: validators.requiredAmount("On-road price / valuation", { min: 10000 }),
    registrationNumber: validators.custom((val, all) => {
      if (all.vehicleCondition === "Pre-Owned / Used Vehicle") {
        return validators.vehicleRegistration("Vehicle registration number")(val, all, "registrationNumber");
      }
      return null;
    }),
    registrationYear: validators.custom((val, all) => {
      if (all.vehicleCondition === "Pre-Owned / Used Vehicle") {
        const str = typeof val === "string" ? val.trim() : "";
        const year = Number(str);
        const currentYear = new Date().getFullYear();
        if (!str || isNaN(year) || year < 1990 || year > currentYear) {
          return `Registration year must be between 1990 and ${currentYear}`;
        }
      }
      return null;
    }),
  },
  employment: {
    employmentType: validators.requiredText("Employment category"),
    monthlyIncomeOrTurnover: validators.requiredText("Monthly net income"),
    existingEmi: validators.custom((val, all) => {
      if (all.hasExistingLoans) {
        return validators.requiredAmount("Monthly EMI obligations", { min: 1 })(val, all, "existingEmi");
      }
      return null;
    }),
    businessName: validators.custom((val, all) => {
      if (all.employmentType === "Business Owner") {
        return validators.requiredText("Business name", { min: 2 })(val, all, "businessName");
      }
      return null;
    }),
  },
  banking: {
    ifscCode: validators.ifsc("Bank IFSC code"),
    primaryBankName: validators.requiredText("Primary bank name", { min: 2 }),
    accountNumber: validators.accountNumber("Bank account number"),
    itrFilingStatus: validators.requiredText("ITR filing status"),
    itrAckNumber: validators.custom((val, all) => {
      if (all.itrFilingStatus === "Filed" && val) {
        return /^\d{15}$/.test(String(val).trim())
          ? null
          : "ITR acknowledgement number must be 15 digits";
      }
      return null;
    }),
  },
};

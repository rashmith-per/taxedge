import { GstBusinessFormData } from "@/modules/gst/gst-registration/components/GstBusinessStep/GstBusinessStep";
import { logger } from "@/core/logging/logger";

/**
 * Normalizes input string to UPPER_SNAKE_CASE for exact matching.
 */
const normalizeInput = (val: string): string =>
  (val || "")
    .toUpperCase()
    .replace(/[^A-Z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");

/**
 * Exact or partial match dictionary lookup (Clean approach without if-else spaghetti)
 */
const getMappedValue = (
  rawInput: string,
  dict: Record<string, string>,
  fallback: string,
): string => {
  if (!rawInput) return fallback;

  // 1. Try Exact O(1) Lookup
  if (dict[rawInput]) return dict[rawInput];

  // 2. Fallback to Partial Match (Production-safe fallback)
  const matchedKey = Object.keys(dict).find((key) => rawInput.includes(key));
  return matchedKey ? dict[matchedKey] : fallback;
};

// --- DICTIONARY MAPS (Configurations) ---

const CONSTITUTION_MAP: Record<string, string> = {
  PARTNERSHIP_FIRM: "PARTNERSHIP",
  LLP: "LLP",
  PRIVATE: "PRIVATE_LIMITED_COMPANY",
  PUBLIC: "PUBLIC_LIMITED_COMPANY",
  HUF: "HUF",
  SOCIETY: "SOCIETY_TRUST_CLUB",
  TRUST: "SOCIETY_TRUST_CLUB",
  AOP: "AOP_BOI",
  BOI: "AOP_BOI",
  GOVERNMENT: "GOVERNMENT_DEPARTMENT",
  FOREIGN: "FOREIGN_COMPANY",
  PARTNERSHIP: "PARTNERSHIP",
};

const NATURE_MAP: Record<string, string> = {
  WHOLESALER: "TRADER",
  DISTRIBUTOR: "TRADER",
  RETAILER: "TRADER",
  TRADER: "TRADER",
  MANUFACTURER: "MANUFACTURER",
  E_COMMERCE: "E_COMMERCE",
  WORK_CONTRACT: "WORK_CONTRACT",
  IMPORT: "IMPORT_EXPORT",
  EXPORT: "IMPORT_EXPORT",
  WARE_HOUSE: "WARE_HOUSE_DEPOT",
  DEPOT: "WARE_HOUSE_DEPOT",
};

const REASON_MAP: Record<string, string> = {
  E_COMMERCE: "ECOMMERCE_OPERATOR_SELLER",
  THRESHOLD: "CROSSED_TURN_OVER_THRESHOLD",
  TURN_OVER: "CROSSED_TURN_OVER_THRESHOLD",
  INTER_STATE: "INTER_STATE_SUPPLY",
  CASUAL: "CASUAL_TAXABLE_PERSON",
  INPUT_SERVICE: "INPUT_SERVICE_DISTRIBUTOR",
};

const ACCOUNT_TYPE_MAP: Record<string, string> = {
  CURRENT: "CURRENT",
  CURRENT_ACCOUNT: "CURRENT",
  SAVINGS: "SAVINGS",
  SAVINGS_ACCOUNT: "SAVINGS",
  CASH_CREDIT: "CASH_CREDIT_OD",
  CASH_CREDIT_OD: "CASH_CREDIT_OD",
  OD: "CASH_CREDIT_OD",
};

/**
 * Exception-safe Date Formatter
 */
const formatBackendDate = (dateStr: string): string => {
  try {
    if (!dateStr || dateStr.trim() === "")
      return new Date().toISOString().split("T")[0];

    // Handles DD/MM/YYYY
    if (dateStr.includes("/")) {
      const parts = dateStr.split("/");
      if (parts.length === 3)
        return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
    }

    // Handles DD-MM-YYYY
    if (dateStr.includes("-")) {
      const parts = dateStr.split("-");
      if (parts[0].length === 2 && parts[2].length === 4) {
        return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
      }
    }
    return dateStr; // Return as-is if already in YYYY-MM-DD
  } catch (error) {
    logger.warn("[gstRegistrationMapper] Date formatting failed, defaulting to today", { error });
    return new Date().toISOString().split("T")[0]; // Safe Fallback
  }
};

/**
 * Maps the frontend GstBusinessFormData to the backend-expected payload format.
 * Includes global Exception Handling.
 */
export const mapGstRegistrationPayload = (
  businessData: GstBusinessFormData,
  customerId?: string,
  gstId?: string,
) => {
  try {
    const rawConstitution = normalizeInput(businessData.businessType);
    const rawNature = normalizeInput(businessData.natureOfBusiness);
    const rawReason = normalizeInput(businessData.reasonForRegistration);
    const rawScheme = normalizeInput(businessData.compositionScheme);
    const resolvedCustomerId = customerId || businessData.customerId || "";
    const resolvedGstId = gstId || businessData.gstId || "";

    return {
      ...(resolvedGstId ? { gstId: resolvedGstId } : {}),
      ...(resolvedCustomerId ? { customerId: resolvedCustomerId } : {}),
      legalName: businessData.legalName,
      tradeName: businessData.businessName,
      constitutionOfBusiness: getMappedValue(
        rawConstitution,
        CONSTITUTION_MAP,
        "PROPRIETORSHIP",
      ),
      natureOfBusiness: getMappedValue(
        rawNature,
        NATURE_MAP,
        "SERVICE_PROVIDER",
      ),
      dateOfCommencement: formatBackendDate(businessData.businessStartDate),
      reasonForRegistration: getMappedValue(
        rawReason,
        REASON_MAP,
        "VOLUNTARY_REGISTRATION",
      ),
      compositionScheme: rawScheme.includes("YES")
        ? "YES_COMPOSITION_SCHEME"
        : "NO_REGULAR_SCHEME",
      placeOfBusiness: "PRINCIPAL_PLACE_OF_BUSINESS",
      businessAddress: businessData.businessAddress,
      city: businessData.city,
      district: businessData.district,
      state: businessData.state,
      pinCode: businessData.pinCode,
      hsnSac: businessData.hsnCode,
      accountHolderName: businessData.accountHolderName,
      bankAccountNumber: businessData.bankAccountNumber,
      ifscCode: businessData.ifscCode,
      bankName: businessData.bankName,
      branchName: businessData.branchName,
      accountType: getMappedValue(
        normalizeInput(businessData.accountType),
        ACCOUNT_TYPE_MAP,
        "CURRENT",
      ),
      authorisedSignatory: businessData.signatoryName ? "YES" : "NO",
      signatoryName: businessData.signatoryName || businessData.legalName,
      signatoryPan: businessData.signatoryPan,
      signatoryDob: formatBackendDate(businessData.signatoryDob),
      designation: businessData.signatoryDesignation || "Owner",
      signatoryMobile: businessData.signatoryMobile,
      signatoryEmail: businessData.signatoryEmail,
    };
  } catch (error) {
    logger.error("[gstRegistrationMapper] Payload Mapping Exception:", { error });
    // In production, throw a standardized AppError so the UI layer's try-catch can show a toast
    throw new Error("Failed to process registration data for submission.");
  }
};

const REVERSE_CONSTITUTION_MAP: Record<string, string> = {
  PROPRIETORSHIP: "Proprietorship",
  PARTNERSHIP: "Partnership Firm",
  LLP: "Limited Liability Partnership (LLP)",
  PRIVATE_LIMITED_COMPANY: "Private Limited Company",
  PUBLIC_LIMITED_COMPANY: "Public Limited Company",
  HUF: "HUF",
  SOCIETY_TRUST_CLUB: "Society / Trust / Club",
  AOP_BOI: "AOP / BOI",
  GOVERNMENT_DEPARTMENT: "Government Department",
  FOREIGN_COMPANY: "Foreign Company",
};

const REVERSE_NATURE_MAP: Record<string, string> = {
  TRADER: "Trader",
  MANUFACTURER: "Manufacturer",
  SERVICE_PROVIDER: "Service Provider",
  RETAILER: "Retailer",
  E_COMMERCE: "E-commerce",
  WORK_CONTRACT: "Contractor / Freelancer",
  IMPORT_EXPORT: "Exporter / Importer",
  WARE_HOUSE_DEPOT: "Wholesaler / Distributor",
};

const REVERSE_REASON_MAP: Record<string, string> = {
  CROSSED_TURN_OVER_THRESHOLD: "Crossed turnover threshold",
  VOLUNTARY_REGISTRATION: "Voluntary registration",
  INTER_STATE_SUPPLY: "Inter-state supply",
  ECOMMERCE_OPERATOR_SELLER: "E-commerce operator / seller",
  CASUAL_TAXABLE_PERSON: "Casual taxable person",
  INPUT_SERVICE_DISTRIBUTOR: "Input Service Distributor",
};

const REVERSE_ACCOUNT_TYPE_MAP: Record<string, string> = {
  CURRENT: "Current",
  SAVINGS: "Savings",
  CASH_CREDIT_OD: "Cash Credit / OD",
};

const REVERSE_PLACE_MAP: Record<string, string> = {
  PRINCIPAL_PLACE_OF_BUSINESS: "Principal place of business",
  ADDITIONAL_PLACE_OF_BUSINESS: "Additional place of business",
};

/**
 * Reverse maps backend BusinessDto to frontend form fields.
 */
export const mapDtoToGstBusinessFormData = (
  dto: any,
): Partial<GstBusinessFormData> => {
  if (!dto) return {};
  const rawConst = String(dto.constitutionOfBusiness || "").toUpperCase();
  const rawNat = String(dto.natureOfBusiness || "").toUpperCase();
  const rawReason = String(dto.reasonForRegistration || "").toUpperCase();
  const rawAcc = String(dto.accountType || "").toUpperCase();
  const rawPlace = String(dto.placeOfBusiness || "").toUpperCase();

  const formatUiDate = (d?: string) => {
    if (!d) return "";
    const p = String(d).split("-");
    if (p.length === 3 && p[0].length === 4) {
      return `${p[2]}-${p[1]}-${p[0]}`;
    }
    return d;
  };

  return {
    gstId: dto.gstId || undefined,
    customerId: dto.customerId || undefined,
    legalName: dto.legalName || "",
    businessName: dto.tradeName || "",
    businessType: REVERSE_CONSTITUTION_MAP[rawConst] || dto.constitutionOfBusiness || "",
    natureOfBusiness: REVERSE_NATURE_MAP[rawNat] || dto.natureOfBusiness || "",
    placeOfBusiness: REVERSE_PLACE_MAP[rawPlace] || dto.placeOfBusiness || "Principal place of business",
    businessStartDate: formatUiDate(dto.dateOfCommencement),
    reasonForRegistration: REVERSE_REASON_MAP[rawReason] || dto.reasonForRegistration || "",
    compositionScheme:
      dto.compositionScheme === "YES_COMPOSITION_SCHEME"
        ? "Yes - composition scheme"
        : "No - regular scheme",
    businessAddress: dto.businessAddress || "",
    city: dto.city || "",
    district: dto.district || "",
    state: dto.state || "",
    pinCode: dto.pinCode || "",
    hsnCode: dto.hsnSac || "",
    accountHolderName: dto.accountHolderName || "",
    bankAccountNumber: dto.bankAccountNumber || "",
    confirmBankAccountNumber: dto.bankAccountNumber || "",
    ifscCode: dto.ifscCode || "",
    bankName: dto.bankName || "",
    branchName: dto.branchName || "",
    accountType: REVERSE_ACCOUNT_TYPE_MAP[rawAcc] || dto.accountType || "Current",
    signatoryName: dto.signatoryName || "",
    signatoryPan: dto.signatoryPan || "",
    signatoryDob: formatUiDate(dto.signatoryDob),
    signatoryDesignation: dto.designation || "Owner",
    signatoryMobile: dto.signatoryMobile || "",
    signatoryEmail: dto.signatoryEmail || "",
  };
};

/**
 * Maps backend DocumentsDto onto DocumentItem array
 */
export const mapDtoToDocuments = (
  dto: any,
  currentDocs: any[],
): any[] => {
  if (!dto || !Array.isArray(currentDocs)) return currentDocs;
  return currentDocs.map((doc) => {
    const key = `${doc.id} ${doc.name || ""}`.toLowerCase();
    let fileUri = doc.fileUri;
    let fileName = doc.fileName;

    if (key.includes("pan") && dto.panCard) {
      fileUri = fileUri || dto.panCard;
      fileName = fileName || String(dto.panCard).split("/").pop() || "panCard";
    } else if ((key.includes("aadhaar") || key.includes("adhar")) && dto.aadhaarCard) {
      fileUri = fileUri || dto.aadhaarCard;
      fileName = fileName || String(dto.aadhaarCard).split("/").pop() || "aadhaarCard";
    } else if (key.includes("business") && dto.businessRegistrationProof) {
      fileUri = fileUri || dto.businessRegistrationProof;
      fileName = fileName || String(dto.businessRegistrationProof).split("/").pop() || "businessRegistrationProof";
    } else if ((key.includes("address") || key.includes("place")) && dto.principalPlaceAddressProof) {
      fileUri = fileUri || dto.principalPlaceAddressProof;
      fileName = fileName || String(dto.principalPlaceAddressProof).split("/").pop() || "principalPlaceAddressProof";
    } else if ((key.includes("bank") || key.includes("passbook") || key.includes("cheque")) && dto.bankPassbookOrCancelledCheque) {
      fileUri = fileUri || dto.bankPassbookOrCancelledCheque;
      fileName = fileName || String(dto.bankPassbookOrCancelledCheque).split("/").pop() || "bankPassbookOrCancelledCheque";
    } else if (key.includes("photo") && dto.passportSizePhotograph) {
      fileUri = fileUri || dto.passportSizePhotograph;
      fileName = fileName || String(dto.passportSizePhotograph).split("/").pop() || "passportSizePhotograph";
    }

    return {
      ...doc,
      fileUri,
      fileName,
    };
  });
};

/**
 * Clean dictionary mapping for Document Upload Types
 */
const DOC_TYPE_MAP: Record<string, string> = {
  PAN: "PAN_CARD",
  AADHAAR: "AADHAAR_CARD",
  ADDRESS_PROOF: "PRINCIPAL_PLACE_ADDRESS_PROOF",
  BUSINESS_PROOF: "BUSINESS_REGISTRATION_PROOF",
  BANK_STATEMENT: "BANK_PASSBOOK_OR_CANCELLED_CHEQUE",
  BANK_PROOF: "BANK_PASSBOOK_OR_CANCELLED_CHEQUE",
  PHOTOGRAPH: "PASSPORT_SIZE_PHOTOGRAPH",
  AUTHORIZATION_PROOF: "PASSPORT_SIZE_PHOTOGRAPH",
};

export const mapDocumentType = (docId: string, subtitle?: string) => {
  const rawId = normalizeInput(docId);
  const type = getMappedValue(rawId, DOC_TYPE_MAP, rawId);

  // Specific condition: If it's address proof, the subtype is the actual proof name
  const subType =
    type === "PRINCIPAL_PLACE_ADDRESS_PROOF"
      ? normalizeInput(subtitle || "")
      : "";

  return { type, subType };
};

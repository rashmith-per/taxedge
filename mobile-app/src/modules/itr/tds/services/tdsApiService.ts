import { apiClient } from "../../../../core/api/apiClient";
import { ApiError } from "../../../../core/api/apiError";
import { tokenManager, JwtUtils } from "../../../../core/authentication/tokenManager";
import { tokenRefreshManager } from "../../../../core/authentication/tokenRefreshManager";
import * as FileSystem from "expo-file-system";
import { TdsCustomerIncomeFormData } from "../types/customerIncome.types";
import { TdsDocumentItem } from "../types/tdsDocuments.types";
import { TaxCalculationBreakdown } from "../types/estimate.types";
import { parsePositiveNumber } from "../utils/tdsValidation";
import { tdsCalculationService } from "./tdsCalculationService";
import { getTdsCustId } from "./tdsDraftService";
import { authApi } from "@/modules/authentication/services/authApi";
import { INITIAL_TDS_DOCUMENTS } from "../constants/tdsDocuments.constants";

export interface RefundBankAccountDto {
  id?: string;
  custId: string;
  accountHolderName: string;
  accountNumber: string;
  confirmAccountNumber?: string;
  ifscCode: string;
  bankName?: string;
  branchName?: string;
  accountType: "SAVINGS" | "CURRENT";
}

export interface IncomeTaxInfoDto {
  id?: number;
  tdsRefundId: string;
  salaryIncome?: number;
  otherIncome?: number;
  interestIncome?: number;
  rentalIncome?: number;
  municipalTaxesPaid?: number;
  shortTermCapitalGains?: number;
  longTermCapitalGains?: number;
  grossTurnover?: number;
  netBusinessProfit?: number;
  homeLoanInterestSec24b?: number;
  deductions80C?: number;
  deductions80D?: number;
}

export interface TdsTaxesPaidDto {
  id?: number;
  custId?: string;
  tdsRefundId: string;
  totalTdsDeducted?: number;
  tcsAmount?: number;
  advanceTax?: number;
  selfAssessmentTax?: number;
}

export interface TdsDocumentsDto {
  id?: number;
  tdsRefundId: string;
  panFile?: string | null;
  form16File?: string | null;
  form16aFile?: string | null;
  aisFile?: string | null;
  tisFile?: string | null;
  bankStatementsFile?: string | null;
  prevItrFile?: string | null;
  tdsCertsFile?: string | null;
  incomeProofsFile?: string | null;
}

export interface BackendApplicationResponse {
  applicationId: string;
  fullName?: string;
  pan?: string;
  mobileNumber?: string;
  email?: string;
  bankName?: string;
  maskedAccountNumber?: string;
  assessmentYear?: string;
  grossTotalIncome?: number;
  taxableIncome?: number;
  estimatedTaxLiability?: number;
  totalTaxCredits?: number;
  estimatedRefund?: number;
  isAdditionalTaxPayable?: boolean;
  status?: string;
  isPaid?: boolean;
  paymentId?: string;
  totalPaid?: number;
  createdAt?: string;
  paidAt?: string;
}

// Helper: Read file URI as Base64 string for REST JSON transport
const readFileAsBase64 = async (uri?: string): Promise<string | null> => {
  if (!uri || typeof uri !== "string") return null;
  const cleanUri = uri.trim();
  if (!cleanUri) return null;

  // 1. Data URI scheme (data:image/png;base64,...)
  if (cleanUri.startsWith("data:")) {
    const commaIdx = cleanUri.indexOf(",");
    return commaIdx !== -1 ? cleanUri.substring(commaIdx + 1) : null;
  }

  // 2. HTTP / HTTPS web URL
  if (cleanUri.startsWith("http://") || cleanUri.startsWith("https://")) {
    try {
      const response = await fetch(cleanUri);
      const blob = await response.blob();
      return await new Promise<string | null>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const res = reader.result as string;
          resolve(res && res.includes(",") ? res.split(",")[1] : res || null);
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.warn("⚠️ [TDS API] Error fetching web URL as Base64:", cleanUri, err);
      return null;
    }
  }

  // 3. Raw Base64 string check (doesn't start with file:, content:, ph:, or /)
  if (
    !cleanUri.startsWith("file:") &&
    !cleanUri.startsWith("content:") &&
    !cleanUri.startsWith("ph:") &&
    !cleanUri.startsWith("/")
  ) {
    return cleanUri;
  }

  // 4. Try reading directly with FileSystem.readAsStringAsync (works for file:// and content://)
  try {
    const base64 = await FileSystem.readAsStringAsync(cleanUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    if (base64 && base64.trim().length > 0) {
      return base64.trim();
    }
  } catch {
    // 5. Fallback: Copy content:// or special URI to temporary cache file then read
    try {
      const ext = cleanUri.split(".").pop()?.split("?")[0] || "bin";
      const cacheDir = (FileSystem as any).cacheDirectory || (FileSystem as any).documentDirectory || "";
      const cachePath = `${cacheDir}upload_cache_${Date.now()}.${ext}`;
      await FileSystem.copyAsync({ from: cleanUri, to: cachePath });
      const base64 = await FileSystem.readAsStringAsync(cachePath, {
        encoding: FileSystem.EncodingType.Base64,
      });
      if (base64 && base64.trim().length > 0) {
        return base64.trim();
      }
    } catch (copyErr) {
      console.warn("⚠️ [TDS API] Error reading file as Base64 fallback:", cleanUri, copyErr);
    }
  }

  return null;
};

// Helper: Extract generated ID from Spring backend string responses like "Saved. ID: TDS-12345"
const extractIdFromResponse = (responseMsg: string): string | null => {
  if (!responseMsg || typeof responseMsg !== "string") return null;
  const match = responseMsg.match(/ID:\s*([A-Za-z0-9_-]+)/i);
  return match ? match[1] : null;
};

const isFilled = (v: unknown) => v !== undefined && v !== null && v !== "";

// Access tokens are short-lived, and this backend answers an expired token with 403
// (not 401), so the shared client's 401-only refresh never fires for TDS calls.
// Refresh up front through the existing refresh manager; logs metadata only, never the token.
const ensureFreshSession = async (): Promise<void> => {
  const token = await tokenManager.getAccessToken().catch(() => null);
  const unexpired = Boolean(token) && JwtUtils.isStructureAndExpiryValid(token as string, 15);
  console.log("[TDS AUTH]", {
    apiUrl: apiClient.getBaseUrl(),
    tokenSource: "tokenManager (access token)",
    tokenPresent: Boolean(token),
    tokenLength: token?.length ?? 0,
    bearerFormatValid: Boolean(token) && (token as string).split(".").length === 3,
    unexpired,
  });
  if (!unexpired) {
    const refreshed = await tokenRefreshManager.attemptRefresh();
    console.log(`[TDS AUTH] Access token expired/missing → refresh ${refreshed ? "succeeded" : "failed"}`);
  }
};

// POSTs a TDS save and logs START / SUCCESS / FAILED with safe metadata only
// (key names and presence flags, never PAN, account numbers or tokens).
const tracedPost = async (
  step: string,
  path: string,
  payload: object,
  ids: { custId?: string; tdsRefundId?: string }
): Promise<string> => {
  const entries = Object.entries(payload);
  console.log(`[TDS SAVE] ${step} → START`, {
    endpoint: path,
    method: "POST",
    customerIdPresent: isFilled(ids.custId),
    customerIdLength: ids.custId?.length ?? 0,
    applicationIdPresent: isFilled(ids.tdsRefundId),
    payloadKeys: entries.map(([k]) => k),
    emptyFields: entries.filter(([, v]) => !isFilled(v)).map(([k]) => k),
  });

  await ensureFreshSession();

  const post = () => apiClient.post<string>(path, payload);
  try {
    let res: string;
    try {
      res = await post();
    } catch (firstErr) {
      // One refresh + retry for a 403, which is how this backend reports an expired token
      if (!(firstErr instanceof ApiError) || firstErr.statusCode !== 403) throw firstErr;
      console.warn(`[TDS AUTH] HTTP 403 on ${path} — refreshing session and retrying once`);
      if (!(await tokenRefreshManager.attemptRefresh())) throw firstErr;
      res = await post();
    }
    console.log(`[TDS SAVE] ${step} → SUCCESS`, { returnedId: extractIdFromResponse(res) });
    return res;
  } catch (err) {
    const apiErr = err instanceof ApiError ? err : ApiError.fromError(err);
    const tokenPresent = Boolean(await tokenManager.getAccessToken().catch(() => null));
    console.error(`[TDS SAVE] ${step} → FAILED`);
    console.error(
      "[TDS API ERROR]\n" +
        `Endpoint: ${apiClient.getBaseUrl()}${path}\n` +
        "Method: POST\n" +
        `Status: ${apiErr.statusCode}\n` +
        `Code: ${apiErr.code}\n` +
        `Message: ${apiErr.message}\n` +
        `Network error: ${apiErr.code === "NETWORK_ERROR"}\n` +
        `Auth rejected: ${apiErr.statusCode === 401 || apiErr.statusCode === 403}\n` +
        `Token present: ${tokenPresent}`
    );
    // Re-throw with the step and endpoint so the screen can say what failed
    throw new ApiError(
      `${step} save failed at POST ${path} (HTTP ${apiErr.statusCode}): ${apiErr.message}`,
      apiErr.statusCode,
      apiErr.code,
      apiErr.errors
    );
  }
};

export const tdsApiService = {
  // ----------------------------------------------------
  // 1. BANK ACCOUNT API
  // ----------------------------------------------------
  saveBankAccount: async (
    bankData: TdsCustomerIncomeFormData["bank"],
    custId: string,
    existingId?: string
  ): Promise<string> => {
    const payload: RefundBankAccountDto = {
      id: existingId || undefined,
      custId: custId || "CUST-DEFAULT",
      accountHolderName: bankData.accountHolderName || "",
      accountNumber: bankData.accountNumber || "",
      confirmAccountNumber: bankData.confirmAccountNumber || bankData.accountNumber || "",
      ifscCode: bankData.ifscCode || "",
      bankName: bankData.bankName || "",
      branchName: bankData.branchName || "",
      accountType: (bankData.accountType?.toUpperCase() === "CURRENT" ? "CURRENT" : "SAVINGS") as any,
    };

    const res = await tracedPost("Bank Account", "/itr/refund-bank-account/save", payload, {
      custId: payload.custId,
      tdsRefundId: existingId,
    });
    const extractedId = extractIdFromResponse(res) || existingId || "";
    return extractedId;
  },

  getBankAccount: async (id: string): Promise<RefundBankAccountDto> => {
    return await apiClient.get<RefundBankAccountDto>(`/itr/refund-bank-account/${id}`);
  },

  getBankAccountByCustId: async (custId: string): Promise<RefundBankAccountDto | null> => {
    try {
      return await apiClient.get<RefundBankAccountDto>(`/itr/refund-bank-account/customer/${custId}`);
    } catch {
      return null;
    }
  },

  // ----------------------------------------------------
  // 2. INCOME & TAX INFO API
  // ----------------------------------------------------
  saveIncomeTaxInfo: async (
    incomeData: TdsCustomerIncomeFormData["income"],
    tdsRefundId: string
  ): Promise<string> => {
    const payload: IncomeTaxInfoDto = {
      tdsRefundId,
      salaryIncome: parsePositiveNumber(incomeData.salaryIncome),
      otherIncome: parsePositiveNumber(incomeData.otherIncome),
      interestIncome: parsePositiveNumber(incomeData.interestIncome),
      rentalIncome: incomeData.hasRentalIncome ? parsePositiveNumber(incomeData.rentalIncome) : 0,
      municipalTaxesPaid: incomeData.hasRentalIncome ? parsePositiveNumber(incomeData.municipalTaxesPaid) : 0,
      shortTermCapitalGains: incomeData.hasCapitalGains ? parsePositiveNumber(incomeData.shortTermCapitalGains) : 0,
      longTermCapitalGains: incomeData.hasCapitalGains ? parsePositiveNumber(incomeData.longTermCapitalGains) : 0,
      grossTurnover: incomeData.hasBusinessIncome ? parsePositiveNumber(incomeData.grossTurnover) : 0,
      netBusinessProfit: incomeData.hasBusinessIncome ? parsePositiveNumber(incomeData.netBusinessProfit) : 0,
      homeLoanInterestSec24b: incomeData.hasHomeLoan ? parsePositiveNumber(incomeData.homeLoanInterestSec24b) : 0,
      deductions80C: incomeData.hasDeductions ? parsePositiveNumber(incomeData.deductions80C) : 0,
      deductions80D: incomeData.hasDeductions ? parsePositiveNumber(incomeData.deductions80D) : 0,
    };

    return await tracedPost("Income", "/itr/income-tax-info/save", payload, { tdsRefundId });
  },

  getIncomeTaxInfo: async (tdsRefundId: string): Promise<IncomeTaxInfoDto | null> => {
    try {
      return await apiClient.get<IncomeTaxInfoDto>(`/itr/income-tax-info/${tdsRefundId}`);
    } catch {
      return null;
    }
  },

  // ----------------------------------------------------
  // 3. TDS & TAXES PAID API
  // ----------------------------------------------------
  saveTdsTaxesPaid: async (
    incomeData: TdsCustomerIncomeFormData["income"],
    custId: string,
    tdsRefundId: string
  ): Promise<string> => {
    const payload: TdsTaxesPaidDto = {
      custId,
      tdsRefundId,
      totalTdsDeducted: parsePositiveNumber(incomeData.totalTdsDeducted),
      tcsAmount: parsePositiveNumber(incomeData.tcsAmount),
      advanceTax: parsePositiveNumber(incomeData.advanceTaxPaid),
      selfAssessmentTax: parsePositiveNumber(incomeData.selfAssessmentTaxPaid),
    };

    return await tracedPost("Taxes Paid", "/itr/tds-taxes-paid/save", payload, { custId, tdsRefundId });
  },

  getTdsTaxesPaid: async (tdsRefundId: string): Promise<TdsTaxesPaidDto | null> => {
    try {
      return await apiClient.get<TdsTaxesPaidDto>(`/itr/tds-taxes-paid/${tdsRefundId}`);
    } catch {
      return null;
    }
  },

  // ----------------------------------------------------
  // 4. TDS DOCUMENTS API (FETCH & UPLOAD)
  // ----------------------------------------------------
  saveDocuments: async (
    documents: TdsDocumentItem[],
    tdsRefundId: string
  ): Promise<string> => {
    const getDocBase64 = async (docKey: string): Promise<string | null> => {
      const key = docKey.toLowerCase();
      const doc = documents.find((d) => {
        const hasUri = d.status === "uploaded" || Boolean(d.fileUri) || Boolean((d as any).uri);
        if (!hasUri) return false;

        const id = (d.id || "").toLowerCase();
        const icon = ((d as any).iconType || "").toLowerCase();
        const type = ((d as any).type || "").toLowerCase();
        const title = (d.title || "").toLowerCase();

        if (id === key || icon === key || type === key) return true;

        if (key === "pan") return id.includes("pan") || icon.includes("pan") || title.includes("pan");
        if (key === "form16") return (id === "form16" || icon === "form16" || (title.includes("form 16") && !title.includes("16a")));
        if (key === "form16a") return id.includes("16a") || icon.includes("16a") || title.includes("16a");
        if (key === "ais") return id.includes("ais") || icon.includes("ais") || title.includes("ais");
        if (key === "tis") return id.includes("tis") || icon.includes("tis") || title.includes("tis");
        if (key === "bank_statements") return id.includes("bank") || icon.includes("bank") || title.includes("bank");
        if (key === "prev_itr") return id.includes("prev") || icon.includes("prev") || title.includes("previous");
        if (key === "tds_certs") return id.includes("tds_cert") || icon.includes("tds_cert") || title.includes("tds cert") || title.includes("deduction");
        if (key === "income_proofs") return id.includes("income") || icon.includes("income") || title.includes("income") || title.includes("supporting");

        return false;
      });

      const targetUri = doc?.fileUri || (doc as any)?.uri;
      if (!doc || !targetUri) return null;
      return await readFileAsBase64(targetUri);
    };

    const [
      panFile,
      form16File,
      form16aFile,
      aisFile,
      tisFile,
      bankStatementsFile,
      prevItrFile,
      tdsCertsFile,
      incomeProofsFile,
    ] = await Promise.all([
      getDocBase64("pan"),
      getDocBase64("form16"),
      getDocBase64("form16a"),
      getDocBase64("ais"),
      getDocBase64("tis"),
      getDocBase64("bank_statements"),
      getDocBase64("prev_itr"),
      getDocBase64("tds_certs"),
      getDocBase64("income_proofs"),
    ]);

    const payload: TdsDocumentsDto = {
      tdsRefundId,
      panFile,
      form16File,
      form16aFile,
      aisFile,
      tisFile,
      bankStatementsFile,
      prevItrFile,
      tdsCertsFile,
      incomeProofsFile,
    };

    console.log("🚀 [TDS API] Posting documents payload to /itr/tds-documents/save:", {
      tdsRefundId,
      hasPan: Boolean(payload.panFile),
      hasForm16: Boolean(payload.form16File),
      hasForm16a: Boolean(payload.form16aFile),
      hasAis: Boolean(payload.aisFile),
      hasTis: Boolean(payload.tisFile),
      hasBankStatements: Boolean(payload.bankStatementsFile),
      hasPrevItr: Boolean(payload.prevItrFile),
      hasTdsCerts: Boolean(payload.tdsCertsFile),
      hasIncomeProofs: Boolean(payload.incomeProofsFile),
    });

    return await tracedPost("Documents", "/itr/tds-documents/save", payload, { tdsRefundId });
  },

  getDocuments: async (tdsRefundId: string): Promise<TdsDocumentsDto | null> => {
    try {
      return await apiClient.get<TdsDocumentsDto>(`/itr/tds-documents/${tdsRefundId}`);
    } catch {
      return null;
    }
  },

  fetchAndMapDocumentsList: async (
    tdsRefundId: string,
    fallbackDocs: TdsDocumentItem[] = INITIAL_TDS_DOCUMENTS
  ): Promise<TdsDocumentItem[]> => {
    await ensureFreshSession();
    const fetched = await tdsApiService.getDocuments(tdsRefundId);
    if (!fetched) return fallbackDocs;

    const fileMap: Record<string, string | null | undefined> = {
      pan: fetched.panFile,
      form16: fetched.form16File,
      form16a: fetched.form16aFile,
      ais: fetched.aisFile,
      tis: fetched.tisFile,
      bank_statements: fetched.bankStatementsFile,
      prev_itr: fetched.prevItrFile,
      tds_certs: fetched.tdsCertsFile,
      income_proofs: fetched.incomeProofsFile,
    };

    return fallbackDocs.map((doc): TdsDocumentItem => {
      const base64Content = fileMap[doc.id];
      if (base64Content && base64Content.length > 0) {
        const mimeType = (doc.allowedExtensions && doc.allowedExtensions.includes("pdf")) ? "application/pdf" : "image/jpeg";
        const fileUri = base64Content.startsWith("data:")
          ? base64Content
          : `data:${mimeType};base64,${base64Content}`;

        return {
          ...doc,
          status: "uploaded",
          fileUri,
          fileName: `${doc.title.replace(/[^a-zA-Z0-9]/g, "_")}_uploaded.pdf`,
          fileSize: `${Math.round((base64Content.length * 3) / 4 / 1024)} KB`,
          mimeType,
        };
      }
      return doc;
    });
  },

  // ----------------------------------------------------
  // 5. COMPREHENSIVE COMBINED APPLICATION SAVE & FETCH
  // ----------------------------------------------------
  saveFullTdsApplication: async (
    formData: TdsCustomerIncomeFormData,
    documents: TdsDocumentItem[],
    custId: string,
    existingTdsRefundId?: string
  ): Promise<string> => {
    if (!custId) {
      throw new Error("Unable to identify the logged-in customer. Please log in again.");
    }

    // The JWT filter trusts token claims only, so confirm the account still exists
    // before writing TDS rows against it.
    const customer = await authApi.checkUser(custId);
    console.log("[TDS] Customer check", {
      customerId: `${custId.slice(0, 2)}******${custId.slice(-2)}`,
      customerIdLength: custId.length,
      reachable: customer.success,
      exists: customer.exists,
    });
    if (!customer.success) {
      throw new Error("Unable to verify your account with the server. Please check your connection and try again.");
    }
    if (!customer.exists) {
      throw new Error("Your customer account was not found on the server. Please log out, then register or log in again before submitting.");
    }

    // 1. Save Bank Account & receive generated / existing tdsRefundId
    const tdsRefundId = await tdsApiService.saveBankAccount(formData.bank, custId, existingTdsRefundId);
    if (!tdsRefundId) {
      throw new Error("Failed to save bank account details.");
    }

    // 2. Save Income Tax Info
    await tdsApiService.saveIncomeTaxInfo(formData.income, tdsRefundId);

    // 3. Save TDS & Taxes Paid
    await tdsApiService.saveTdsTaxesPaid(formData.income, custId, tdsRefundId);

    // 4. Save Documents if any are uploaded
    const hasUploadedDocs = documents.some((d) => d.status === "uploaded" || Boolean(d.fileUri));
    if (hasUploadedDocs) {
      await tdsApiService.saveDocuments(documents, tdsRefundId);
    }

    return tdsRefundId;
  },

  fetchFullTdsApplication: async (
    custId: string,
    existingTdsRefundId?: string
  ): Promise<{
    tdsRefundId: string | null;
    bank?: TdsCustomerIncomeFormData["bank"];
    income?: TdsCustomerIncomeFormData["income"];
    documents?: TdsDocumentItem[];
  } | null> => {
    try {
      await ensureFreshSession();
      let bankDto: RefundBankAccountDto | null = null;
      let tdsRefundId: string | null = existingTdsRefundId || null;

      if (tdsRefundId) {
        try {
          bankDto = await tdsApiService.getBankAccount(tdsRefundId);
        } catch {
          bankDto = await tdsApiService.getBankAccountByCustId(custId);
        }
      } else {
        bankDto = await tdsApiService.getBankAccountByCustId(custId);
      }

      if (!bankDto || !bankDto.id) {
        return null;
      }

      tdsRefundId = bankDto.id;

      // Parallel fetch of income, taxes paid, and documents
      const [incomeDto, taxesPaidDto, docsList] = await Promise.all([
        tdsApiService.getIncomeTaxInfo(tdsRefundId),
        tdsApiService.getTdsTaxesPaid(tdsRefundId),
        tdsApiService.fetchAndMapDocumentsList(tdsRefundId),
      ]);

      const bankData: TdsCustomerIncomeFormData["bank"] = {
        accountHolderName: bankDto.accountHolderName || "",
        accountNumber: bankDto.accountNumber || "",
        confirmAccountNumber: bankDto.confirmAccountNumber || bankDto.accountNumber || "",
        ifscCode: bankDto.ifscCode || "",
        bankName: bankDto.bankName || "",
        branchName: bankDto.branchName || "",
        accountType: (bankDto.accountType?.toLowerCase() === "current" ? "current" : "savings") as any,
        isIfscVerified: Boolean(bankDto.bankName),
      };

      const incomeData: Partial<TdsCustomerIncomeFormData["income"]> = {
        salaryIncome: incomeDto?.salaryIncome ? String(incomeDto.salaryIncome) : "",
        otherIncome: incomeDto?.otherIncome ? String(incomeDto.otherIncome) : "",
        interestIncome: incomeDto?.interestIncome ? String(incomeDto.interestIncome) : "",
        rentalIncome: incomeDto?.rentalIncome ? String(incomeDto.rentalIncome) : "",
        hasRentalIncome: Boolean(incomeDto?.rentalIncome && incomeDto.rentalIncome > 0),
        municipalTaxesPaid: incomeDto?.municipalTaxesPaid ? String(incomeDto.municipalTaxesPaid) : "",
        shortTermCapitalGains: incomeDto?.shortTermCapitalGains ? String(incomeDto.shortTermCapitalGains) : "",
        longTermCapitalGains: incomeDto?.longTermCapitalGains ? String(incomeDto.longTermCapitalGains) : "",
        hasCapitalGains: Boolean(
          (incomeDto?.shortTermCapitalGains && incomeDto.shortTermCapitalGains > 0) ||
            (incomeDto?.longTermCapitalGains && incomeDto.longTermCapitalGains > 0)
        ),
        grossTurnover: incomeDto?.grossTurnover ? String(incomeDto.grossTurnover) : "",
        netBusinessProfit: incomeDto?.netBusinessProfit ? String(incomeDto.netBusinessProfit) : "",
        hasBusinessIncome: Boolean(incomeDto?.netBusinessProfit && incomeDto.netBusinessProfit > 0),
        homeLoanInterestSec24b: incomeDto?.homeLoanInterestSec24b ? String(incomeDto.homeLoanInterestSec24b) : "",
        hasHomeLoan: Boolean(incomeDto?.homeLoanInterestSec24b && incomeDto.homeLoanInterestSec24b > 0),
        deductions80C: incomeDto?.deductions80C ? String(incomeDto.deductions80C) : "",
        deductions80D: incomeDto?.deductions80D ? String(incomeDto.deductions80D) : "",
        hasDeductions: Boolean(
          (incomeDto?.deductions80C && incomeDto.deductions80C > 0) ||
            (incomeDto?.deductions80D && incomeDto.deductions80D > 0)
        ),
        totalTdsDeducted: taxesPaidDto?.totalTdsDeducted ? String(taxesPaidDto.totalTdsDeducted) : "",
        tcsAmount: taxesPaidDto?.tcsAmount ? String(taxesPaidDto.tcsAmount) : "",
        advanceTaxPaid: taxesPaidDto?.advanceTax ? String(taxesPaidDto.advanceTax) : "",
        selfAssessmentTaxPaid: taxesPaidDto?.selfAssessmentTax ? String(taxesPaidDto.selfAssessmentTax) : "",
      };

      return {
        tdsRefundId,
        bank: bankData,
        income: incomeData as TdsCustomerIncomeFormData["income"],
        documents: docsList,
      };
    } catch (err) {
      console.warn("[TDS API] Error fetching full application:", err);
      return null;
    }
  },

  // ----------------------------------------------------
  // 6. TAX CALCULATION & SUBMISSION API
  // ----------------------------------------------------
  calculateTax: async (formData: TdsCustomerIncomeFormData): Promise<TaxCalculationBreakdown> => {
    try {
      const payload = {
        assessmentYear: formData.income.assessmentYear,
        financialYear: formData.income.financialYear,
        taxRegime: formData.income.taxRegime,
        salaryIncome: parsePositiveNumber(formData.income.salaryIncome),
        otherIncome: parsePositiveNumber(formData.income.otherIncome),
        interestIncome: parsePositiveNumber(formData.income.interestIncome),
        rentalIncome: formData.income.hasRentalIncome ? parsePositiveNumber(formData.income.rentalIncome) : 0,
        capitalGainsIncome: formData.income.hasCapitalGains
          ? parsePositiveNumber(formData.income.shortTermCapitalGains) + parsePositiveNumber(formData.income.longTermCapitalGains)
          : 0,
        businessIncome: formData.income.hasBusinessIncome ? parsePositiveNumber(formData.income.netBusinessProfit) : 0,
        deductions80C: formData.income.hasDeductions ? parsePositiveNumber(formData.income.deductions80C) : 0,
        deductions80D: formData.income.hasDeductions ? parsePositiveNumber(formData.income.deductions80D) : 0,
        homeLoanInterest: formData.income.hasHomeLoan ? parsePositiveNumber(formData.income.homeLoanInterestSec24b) : 0,
        otherDeductions: formData.income.hasDeductions ? parsePositiveNumber(formData.income.otherDeductions) : 0,
        totalTdsDeducted: parsePositiveNumber(formData.income.totalTdsDeducted),
        tcsAmount: parsePositiveNumber(formData.income.tcsAmount),
        advanceTaxPaid: parsePositiveNumber(formData.income.advanceTaxPaid),
        selfAssessmentTaxPaid: parsePositiveNumber(formData.income.selfAssessmentTaxPaid),
      };

      const response = await apiClient.post<TaxCalculationBreakdown>("/tds-refund/calculate", payload);
      if (response && response.grossTotalIncome !== undefined) {
        return response;
      }
    } catch {
      // Fallback to local pure calculation engine
    }
    return tdsCalculationService.calculate(formData);
  },

  submitApplicationDraft: async (
    formData: TdsCustomerIncomeFormData,
    documents: TdsDocumentItem[],
    calculation: TaxCalculationBreakdown,
    existingAppId?: string
  ): Promise<BackendApplicationResponse> => {
    // First save all structured sections to DB backend
    const custId = getTdsCustId(formData.personal.mobileNumber);
    const savedId = await tdsApiService.saveFullTdsApplication(formData, documents as any, custId, existingAppId);

    const payload = {
      applicationId: savedId || existingAppId,
      fullName: formData.personal.fullName,
      pan: formData.personal.pan,
      aadhaar: formData.personal.aadhaar,
      dob: formData.personal.dob,
      mobileNumber: formData.personal.mobileNumber,
      email: formData.personal.email,
      address: formData.personal.residentialAddress,
      city: formData.personal.city,
      state: formData.personal.state,
      pinCode: formData.personal.pinCode,

      accountHolderName: formData.bank.accountHolderName,
      accountNumber: formData.bank.accountNumber,
      ifscCode: formData.bank.ifscCode,
      bankName: formData.bank.bankName,
      branchName: formData.bank.branchName,
      accountType: formData.bank.accountType,

      assessmentYear: formData.income.assessmentYear,
      financialYear: formData.income.financialYear,
      taxRegime: formData.income.taxRegime,

      salaryIncome: parsePositiveNumber(formData.income.salaryIncome),
      otherIncome: parsePositiveNumber(formData.income.otherIncome),
      interestIncome: parsePositiveNumber(formData.income.interestIncome),
      rentalIncome: parsePositiveNumber(formData.income.rentalIncome),
      capitalGainsIncome:
        parsePositiveNumber(formData.income.shortTermCapitalGains) +
        parsePositiveNumber(formData.income.longTermCapitalGains),
      businessIncome: parsePositiveNumber(formData.income.netBusinessProfit),

      totalTdsDeducted: parsePositiveNumber(formData.income.totalTdsDeducted),
      tcsAmount: parsePositiveNumber(formData.income.tcsAmount),
      advanceTaxPaid: parsePositiveNumber(formData.income.advanceTaxPaid),
      selfAssessmentTaxPaid: parsePositiveNumber(formData.income.selfAssessmentTaxPaid),
      carryForwardLoss: parsePositiveNumber(formData.income.carryForwardLossAmount),

      deductions80C: parsePositiveNumber(formData.income.deductions80C),
      deductions80D: parsePositiveNumber(formData.income.deductions80D),
      homeLoanInterest: parsePositiveNumber(formData.income.homeLoanInterestSec24b),
      otherDeductions: parsePositiveNumber(formData.income.otherDeductions),

      grossTotalIncome: calculation.grossTotalIncome,
      totalDeductions: calculation.totalEligibleDeductions,
      taxableIncome: calculation.taxableIncome,
      estimatedTaxLiability: calculation.estimatedTaxLiability,
      totalTaxCredits: calculation.totalTaxCredits,
      estimatedRefund: calculation.estimatedRefund,
      isAdditionalTaxPayable: calculation.isAdditionalTaxPayable,

      documentsJson: JSON.stringify(
        documents
          .filter((d) => d.status === "uploaded" && d.fileUri)
          .map((d) => ({
            id: d.id,
            title: d.title,
            fileName: d.fileName,
            fileSize: d.fileSize,
            mimeType: d.mimeType,
          }))
      ),
    };

    try {
      return await apiClient.post<BackendApplicationResponse>("/tds-refund/apply", payload);
    } catch {
      return {
        applicationId: savedId || existingAppId || `TDS-${Date.now()}`,
        fullName: formData.personal.fullName,
        pan: formData.personal.pan,
        mobileNumber: formData.personal.mobileNumber,
        email: formData.personal.email,
        bankName: formData.bank.bankName,
        maskedAccountNumber: formData.bank.accountNumber,
        assessmentYear: formData.income.assessmentYear,
        grossTotalIncome: calculation.grossTotalIncome,
        taxableIncome: calculation.taxableIncome,
        estimatedTaxLiability: calculation.estimatedTaxLiability,
        totalTaxCredits: calculation.totalTaxCredits,
        estimatedRefund: calculation.estimatedRefund,
        isAdditionalTaxPayable: calculation.isAdditionalTaxPayable,
        status: "SUBMITTED",
        isPaid: false,
        createdAt: new Date().toISOString(),
      };
    }
  },

  payAndConfirm: async (
    applicationId: string,
    paymentMethod: string,
    amount: number
  ): Promise<BackendApplicationResponse> => {
    const payload = {
      applicationId,
      paymentMethod,
      amount,
    };
    try {
      return await apiClient.post<BackendApplicationResponse>("/tds-refund/pay", payload);
    } catch {
      return {
        applicationId,
        status: "PAID",
        isPaid: true,
        totalPaid: amount,
        paidAt: new Date().toISOString(),
      } as BackendApplicationResponse;
    }
  },

  fetchStatus: async (applicationId: string): Promise<BackendApplicationResponse> => {
    return await apiClient.get<BackendApplicationResponse>(`/tds-refund/status/${applicationId}`);
  },
};

export default tdsApiService;

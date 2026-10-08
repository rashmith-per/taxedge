import { apiClient, SERVER_IP, SERVER_PORT } from "../../../core/api/apiClient";
import { tokenManager } from "../../../core/authentication/tokenManager";
import { logger } from "../../../core/logging/logger";

export interface UploadDocumentItem {
  id?: string;
  name?: string;
  fileUri?: string | null;
  fileName?: string | null;
  subtitle?: string | null;
}

export class GstApiUploadError extends Error {
  constructor(message: string, public readonly statusCode?: number) {
    super(message);
    this.name = "GstApiUploadError";
  }
}

/**
 * Execute a multipart form-data upload via XMLHttpRequest (bulletproof in React Native).
 */
export async function executeXhrUpload(
  url: string,
  method: "POST" | "PUT",
  formData: FormData,
  onFallback?: () => Promise<string>
): Promise<string> {
  const token = await tokenManager.getAccessToken();

  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);

    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }

    xhr.onload = async () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.responseText);
      } else if ((xhr.status === 404 || xhr.status === 500 || xhr.status === 400) && onFallback) {
        try {
          const fallbackResult = await onFallback();
          resolve(fallbackResult);
        } catch (fbErr) {
          reject(fbErr);
        }
      } else {
        let errText = xhr.responseText;
        try {
          const parsed = JSON.parse(xhr.responseText);
          if (parsed.message) {
            errText = parsed.message;
          }
        } catch (parseErr) {
          logger.debug("[gstUploadHelper] Non-JSON error response during XHR upload", { status: xhr.status, error: parseErr });
        }
        reject(
          new GstApiUploadError(
            `Upload failed with status ${xhr.status}: ${errText}`,
            xhr.status
          )
        );
      }
    };

    xhr.onerror = () => {
      reject(new GstApiUploadError(`Network error during XHR ${method} upload to ${url}`));
    };

    xhr.send(formData);
  });
}

/**
 * Get active base URL with default fallback.
 */
export function resolveApiBaseUrl(): string {
  return apiClient.getBaseUrl() || `http://${SERVER_IP}:${SERVER_PORT}`;
}

/**
 * Map document key to registration backend field name.
 */
export function mapRegistrationDocField(key: string): string {
  const k = key.toLowerCase();
  if (k.includes("pan")) return "panCard";
  if (k.includes("aadhaar") || k.includes("adhar")) return "aadhaarCard";
  if (k.includes("business")) return "businessRegistrationProof";
  if (k.includes("address") || k.includes("place")) return "principalPlaceAddressProof";
  if (k.includes("bank") || k.includes("cheque") || k.includes("passbook") || k.includes("statement")) {
    return "bankPassbookOrCancelledCheque";
  }
  if (k.includes("photo") || k.includes("passport") || k.includes("image")) {
    return "passportSizePhotograph";
  }
  return "";
}

/**
 * Map document key to filing backend field name.
 */
export function mapFilingDocField(key: string): string {
  const k = key.toLowerCase();
  if (k.includes("sales")) return "salesInvoice";
  if (k.includes("purchase")) return "purchaseInvoices";
  if (k.includes("2b") || k.includes("itc")) return "gstr2bItcStatement";
  if (k.includes("credit")) return "creditNotes";
  if (k.includes("debit")) return "debitNotes";
  if (k.includes("e-invoice") || k.includes("einvoice")) return "eInvoiceData";
  if (k.includes("e-way") || k.includes("eway")) return "eWayBillData";
  if (k.includes("expense") || k.includes("voucher")) return "expenseInvoicesAndVouchers";
  if (k.includes("bank")) return "bankStatement";
  if (k.includes("previous") && k.includes("acknowledgement")) return "previousFilingAcknowledgement";
  if (k.includes("previous")) return "previousGstReturns";
  return "otherSupportingDocuments";
}

/**
 * Normalize address proof type enum.
 */
export function resolveAddressProofEnum(selectedType?: string | null): string {
  const raw = (selectedType || "RENTAL_AGREEMENT").toUpperCase().replace(/[^A-Z]/g, "_");
  if (raw.includes("OWNER")) return "OWNERSHIP_PROOF";
  if (raw.includes("ELECTRI")) return "ELECTRICITY_BILL";
  if (raw.includes("OTHER")) return "OTHER_ADDRESS_PROOF";
  return "RENTAL_AGREEMENT";
}

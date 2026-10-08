import { apiClient, SERVER_IP, SERVER_PORT, getDefaultBaseUrl } from "@/core/api/apiClient";
import { tokenManager, JwtUtils } from "@/core/authentication/tokenManager";
import { tokenRefreshManager } from "@/core/authentication/tokenRefreshManager";
import { useAuthStore } from "@/modules/authentication/store/authStore";
import { authStorage } from "@/modules/authentication/services/authStorage";
import { logger } from "@/core/logging/logger";
import type { TaxNoticeFormData } from "../taxNotice/types/taxNotice.types";
import { appendFilePart } from "@/shared/utils/formDataFile";

/**
 * Resolve the active backend base URL with robust fallbacks.
 */
const resolveBaseUrl = (): string => {
  const custom = apiClient.getBaseUrl();
  if (custom && custom.trim()) {
    return custom.replace(/\/$/, "");
  }
  const defaultUrl = getDefaultBaseUrl();
  if (defaultUrl && defaultUrl.trim()) {
    return defaultUrl.replace(/\/$/, "");
  }
  return `http://${SERVER_IP}:${SERVER_PORT}`;
};

/**
 * Resolve the current access token across tokenManager, authStore, and authStorage.
 */
const resolveAccessToken = async (): Promise<string | null> => {
  try {
    const token = await tokenManager.getAccessToken();
    if (token && token.trim()) return token.trim();
  } catch (err) {
    logger.debug("[taxNoticeApi] Token manager lookup fallback", { error: err });
  }

  try {
    const authState = useAuthStore.getState();
    const token =
      authState.authenticatedUser?.token ||
      (authState.customer as any)?.token;
    if (token && typeof token === "string" && token.trim()) return token.trim();
  } catch (err) {
    logger.debug("[taxNoticeApi] AuthStore token lookup fallback", { error: err });
  }

  try {
    const user = authStorage.getUser();
    if (user?.token && typeof (user as any).token === "string" && (user as any).token.trim()) {
      return (user as any).token.trim();
    }
  } catch (err) {
    logger.debug("[taxNoticeApi] AuthStorage token lookup fallback", { error: err });
  }

  return null;
};

/**
 * Resolve Customer ID across auth store, storage, and JWT token payload.
 */
const resolveCustomerId = async (): Promise<string> => {
  try {
    const authState = useAuthStore.getState();
    const custId =
      authState.customer?.customerId ||
      authState.authenticatedUser?.customerId ||
      authState.authenticatedUser?.custId ||
      (authState.customer as any)?.custId;
    if (custId && typeof custId === "string" && custId.trim() && custId.trim() !== "undefined") {
      return custId.trim();
    }
  } catch (err) {
    logger.debug("[taxNoticeApi] AuthStore customerId lookup fallback", { error: err });
  }

  try {
    const user = authStorage.getUser();
    const session = authStorage.getSession();
    const custId =
      user?.customerId ||
      user?.custId ||
      session?.activeCustId;
    if (custId && typeof custId === "string" && custId.trim() && custId.trim() !== "undefined") {
      return custId.trim();
    }
  } catch (err) {
    logger.debug("[taxNoticeApi] AuthStorage customerId lookup fallback", { error: err });
  }

  try {
    const token = await tokenManager.getAccessToken();
    if (token) {
      const payload = JwtUtils.decodePayload(token);
      if (payload?.sub && typeof payload.sub === "string" && payload.sub.trim() && payload.sub.trim() !== "undefined") {
        return payload.sub.trim();
      }
    }
  } catch (err) {
    logger.debug("[taxNoticeApi] Token payload customerId lookup fallback", { error: err });
  }

  return "";
};

/**
 * Format human-readable date string into ISO YYYY-MM-DD for Spring Boot LocalDate.
 */
const formatDateForBackend = (dateStr?: string): string | null => {
  if (!dateStr) return null;
  const trimmed = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  const parts = trimmed.split(/[\s-]+/);
  if (parts.length === 3) {
    const monthMap: Record<string, string> = {
      Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
      Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
      January: "01", February: "02", March: "03", April: "04", June: "06",
      July: "07", August: "08", September: "09", October: "10", November: "11", December: "12",
    };
    if (monthMap[parts[1]]) {
      const day = parts[0].padStart(2, "0");
      const month = monthMap[parts[1]];
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
    // If DD-MM-YYYY or DD/MM/YYYY
    if (/^\d{1,2}$/.test(parts[0]) && /^\d{1,2}$/.test(parts[1]) && /^\d{4}$/.test(parts[2])) {
      return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
    }
  }
  return trimmed;
};

/**
 * Clean assessment year format to match backend pattern: ^[0-9]{4}-[0-9]{2}$ (e.g. 2024-25).
 */
const formatAssessmentYearForBackend = (ayStr?: string): string => {
  if (!ayStr) return "2024-25";
  const cleaned = ayStr.replace(/^AY\s*/i, "").trim();
  return cleaned || "2024-25";
};

interface XhrRequestOptions {
  url: string;
  method: "POST" | "PUT";
  formData: FormData;
  onSuccessText?: (text: string) => string;
}

/**
 * Execute multipart form-data upload via XMLHttpRequest with silent 401 retry.
 */
const executeXhrWithAuth = async (
  options: XhrRequestOptions,
  isRetry = false
): Promise<string> => {
  const token = await resolveAccessToken();

  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(options.method, options.url);

    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }

    xhr.onload = async () => {
      // Handle 401/403 with automatic token refresh retry
      if ((xhr.status === 401 || xhr.status === 403) && !isRetry) {
        logger.debug("[taxNoticeApi] 401/403 received — attempting token refresh retry", { url: options.url, status: xhr.status });
        try {
          const refreshed = await tokenRefreshManager.attemptRefresh();
          if (refreshed) {
            logger.debug("[taxNoticeApi] Token refreshed — retrying request", { method: options.method });
            try {
              const retryResult = await executeXhrWithAuth(options, true);
              resolve(retryResult);
              return;
            } catch (retryErr) {
              reject(retryErr);
              return;
            }
          }
        } catch (refreshErr) {
          logger.warn("[taxNoticeApi] Refresh attempt failed during XHR retry:", { error: refreshErr });
        }
        reject(new Error("Session expired. Please log in again."));
        return;
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        const text = xhr.responseText;
        const result = options.onSuccessText ? options.onSuccessText(text) : text;
        resolve(result);
      } else if (
        xhr.status === 400 &&
        (xhr.responseText.includes("already registered") ||
          xhr.responseText.includes("already exist"))
      ) {
        resolve(xhr.responseText);
      } else {
        let errMessage = xhr.responseText || `Server responded with ${xhr.status}`;
        try {
          const parsed = JSON.parse(xhr.responseText);
          if (parsed.message) errMessage = parsed.message;
        } catch (parseErr) {
          logger.debug("[taxNoticeApi] Non-JSON error response from server", { status: xhr.status, error: parseErr });
        }
        reject(new Error(errMessage));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Unable to connect to server. Please check your network connection."));
    };

    xhr.ontimeout = () => {
      reject(new Error("Request timed out. Please try again."));
    };

    xhr.send(options.formData);
  });
};

export const taxNoticeApi = {
  /**
   * 1. Register a new Tax Notice Assistance Request
   */
  registerTaxNotice: async (data: TaxNoticeFormData): Promise<string> => {
    const custId = await resolveCustomerId();
    const finalCustId = custId || (data.pan ? `CUST-${data.pan}` : "CUST-DEFAULT");

    const formData = new FormData();
    const jsonData = {
      customerId: finalCustId,
      custId: finalCustId,
      permanentAccountNumber: (data.pan || "").toUpperCase().trim(),
      assessmentYear: formatAssessmentYearForBackend(data.assessmentYear),
      noticeTypeSection: data.noticeType || "143(1)(a)",
      noticeDate: formatDateForBackend(data.noticeDate),
      noticeReferenceNumberDin: (data.noticeNumber || "").trim(),
      responseDueDate: formatDateForBackend(data.responseDueDate),
      message: data.customerExplanation || "",
    };
    formData.append("data", JSON.stringify(jsonData));

    if (data.noticeFileUri) {
      appendFilePart(formData, "file", {
        uri: data.noticeFileUri,
        name: data.noticeFileName || "notice_document.pdf",
        type: data.noticeFileType || "application/pdf",
      });
    }

    const url = `${resolveBaseUrl()}/api/v1/itr/tax-notice/register`;

    return executeXhrWithAuth({
      url,
      method: "POST",
      formData,
      onSuccessText: (responseText) => {
        let finalNoticeId = responseText;
        if (responseText.includes("Notice ID:")) {
          finalNoticeId = responseText.split("Notice ID:")[1].trim();
        } else {
          try {
            const parsed = JSON.parse(responseText);
            finalNoticeId = parsed.noticeId || parsed.id || responseText;
          } catch (parseErr) {
            logger.debug("[taxNoticeApi] Non-JSON success response for registerTaxNotice", { error: parseErr });
          }
        }
        return finalNoticeId;
      },
    });
  },

  /**
   * 2. Update an existing Tax Notice Assistance Request
   */
  updateTaxNotice: async (noticeId: string, data: TaxNoticeFormData): Promise<string> => {
    const custId = await resolveCustomerId();
    const finalCustId = custId || (data.pan ? `CUST-${data.pan}` : "CUST-DEFAULT");

    const formData = new FormData();
    const jsonData = {
      customerId: finalCustId,
      custId: finalCustId,
      permanentAccountNumber: (data.pan || "").toUpperCase().trim(),
      assessmentYear: formatAssessmentYearForBackend(data.assessmentYear),
      noticeTypeSection: data.noticeType || "143(1)(a)",
      noticeDate: formatDateForBackend(data.noticeDate),
      noticeReferenceNumberDin: (data.noticeNumber || "").trim(),
      responseDueDate: formatDateForBackend(data.responseDueDate),
      message: data.customerExplanation || "",
    };
    formData.append("data", JSON.stringify(jsonData));

    if (data.noticeFileUri) {
      appendFilePart(formData, "file", {
        uri: data.noticeFileUri,
        name: data.noticeFileName || "notice_document.pdf",
        type: data.noticeFileType || "application/pdf",
      });
    }

    const url = `${resolveBaseUrl()}/api/v1/itr/tax-notice/update/${noticeId}`;

    return executeXhrWithAuth({
      url,
      method: "PUT",
      formData,
      onSuccessText: (responseText) => {
        let finalNoticeId = responseText;
        if (responseText.includes("Notice ID:")) {
          finalNoticeId = responseText.split("Notice ID:")[1].trim();
        }
        return finalNoticeId || noticeId;
      },
    });
  },

  /**
   * 3. Get Tax Notice Details
   */
  getTaxNotice: async (noticeId: string): Promise<any> => {
    return apiClient.get(`/api/v1/itr/tax-notice/${noticeId}`);
  },

  /**
   * 4. Register Additional Supporting Documents for a Notice
   */
  registerDocuments: async (noticeId: string, documents: Record<string, any>): Promise<string> => {
    const formData = new FormData();
    formData.append("data", JSON.stringify({ noticeId, message: "" }));

    for (const [key, fileObj] of Object.entries(documents)) {
      if (fileObj && fileObj.uri) {
        appendFilePart(formData, key, {
          uri: fileObj.uri,
          name: fileObj.name || `${key}.pdf`,
          type: fileObj.mimeType || "application/pdf",
        });
      }
    }

    const url = `${resolveBaseUrl()}/api/v1/itr/tax-notice/${noticeId}/document/register`;

    return executeXhrWithAuth({
      url,
      method: "POST",
      formData,
    });
  },

  /**
   * 5. Get Tax Notice Documents
   */
  getDocuments: async (documentId: string): Promise<any> => {
    return apiClient.get(`/api/v1/itr/tax-notice/${documentId}/documents`);
  },

  /**
   * 6. Update Tax Notice Documents
   */
  updateDocuments: async (documentId: string, documents: Record<string, any>): Promise<string> => {
    const formData = new FormData();
    formData.append("data", JSON.stringify({ documentId }));

    for (const [key, fileObj] of Object.entries(documents)) {
      if (fileObj && fileObj.uri) {
        appendFilePart(formData, key, {
          uri: fileObj.uri,
          name: fileObj.name || `${key}.pdf`,
          type: fileObj.mimeType || "application/pdf",
        });
      }
    }

    const url = `${resolveBaseUrl()}/api/v1/itr/tax-notice/${documentId}/documents/update`;

    return executeXhrWithAuth({
      url,
      method: "PUT",
      formData,
    });
  },
};

export default taxNoticeApi;

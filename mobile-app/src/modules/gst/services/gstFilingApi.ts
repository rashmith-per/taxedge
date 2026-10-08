import { apiClient } from "../../../core/api/apiClient";
import { tokenManager } from "../../../core/authentication/tokenManager";
import {
  UploadDocumentItem,
  executeXhrUpload,
  resolveApiBaseUrl,
  mapFilingDocField,
} from "./gstUploadHelper";
import { appendFilePart } from "@/shared/utils/formDataFile";
import type { GstFilingPayload } from "@/modules/gst/gst-filing/types/gstFilingPayload.types";

export const gstFilingApi = {
  createFiling: async (payload: GstFilingPayload, resolveCustomerId: () => Promise<string>) => {
    const token = await tokenManager.getAccessToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const finalPayload = { ...payload };
    if (
      !finalPayload.customerId ||
      String(finalPayload.customerId).trim() === "" ||
      String(finalPayload.customerId).trim() === "undefined"
    ) {
      const custId = await resolveCustomerId();
      if (custId) finalPayload.customerId = custId;
    }

    if (finalPayload.returnType) {
      const rt = String(finalPayload.returnType).toUpperCase();
      finalPayload.returnType = rt.includes("3B") || rt.includes("3_B") ? "GSTR_3B" : "GSTR_1";
    }

    if (finalPayload.financialYear) {
      finalPayload.financialYear = String(finalPayload.financialYear).replace(/^FY\s*/i, "").trim();
    }

    return apiClient.post<string>("/api/v1/gst/filing/create", finalPayload, { headers });
  },

  updateFiling: async (filingId: string, payload: GstFilingPayload, resolveCustomerId: () => Promise<string>) => {
    const token = await tokenManager.getAccessToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const finalPayload = { ...payload };
    if (
      !finalPayload.customerId ||
      String(finalPayload.customerId).trim() === "" ||
      String(finalPayload.customerId).trim() === "undefined"
    ) {
      const custId = await resolveCustomerId();
      if (custId) finalPayload.customerId = custId;
    }

    if (finalPayload.returnType) {
      const rt = String(finalPayload.returnType).toUpperCase();
      finalPayload.returnType = rt.includes("3B") || rt.includes("3_B") ? "GSTR_3B" : "GSTR_1";
    }

    if (finalPayload.financialYear) {
      finalPayload.financialYear = String(finalPayload.financialYear).replace(/^FY\s*/i, "").trim();
    }

    const cleanFilingId = String(filingId || "").trim();
    return apiClient.put<string>(`/api/v1/gst/filing/update/${cleanFilingId}`, finalPayload, { headers });
  },

  getFilingById: async (filingId: string) => {
    const token = await tokenManager.getAccessToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const cleanId = String(filingId || "").trim();
    return apiClient.get<any>(`/api/v1/gst/filing/${cleanId}`, { headers });
  },

  getFilingDocuments: async (gstfilingId: string) => {
    const token = await tokenManager.getAccessToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const cleanId = String(gstfilingId || "").trim();
    return apiClient.get<any>(`/api/v1/gst/filing/documents/${cleanId}`, { headers });
  },

  uploadAllFilingDocuments: async (
    filingId: string,
    documents: UploadDocumentItem[]
  ): Promise<string> => {
    const formData = new FormData();
    let hasFiles = false;

    for (const doc of documents) {
      if (!doc.fileUri) continue;
      const key = `${doc.id || ""} ${doc.name || ""}`.toLowerCase();
      const fieldName = mapFilingDocField(key);

      if (fieldName) {
        hasFiles = true;
        const name = doc.fileName || `${fieldName}.pdf`;
        const isPdf = name.toLowerCase().endsWith(".pdf");
        appendFilePart(formData, fieldName, {
          uri: doc.fileUri,
          name: name,
          type: isPdf ? "application/pdf" : "image/jpeg",
        });
      }
    }

    if (!hasFiles) return "No documents selected for upload";

    const cleanFilingId = String(filingId || "").trim();
    const url = `${resolveApiBaseUrl()}/api/v1/gst/filing/documents/${cleanFilingId}/upload`;
    return executeXhrUpload(url, "POST", formData, () =>
      gstFilingApi.updateAllFilingDocuments(cleanFilingId, documents)
    );
  },

  updateAllFilingDocuments: async (
    filingId: string,
    documents: UploadDocumentItem[]
  ): Promise<string> => {
    const formData = new FormData();
    let hasFiles = false;

    for (const doc of documents) {
      if (!doc.fileUri) continue;
      const key = `${doc.id || ""} ${doc.name || ""}`.toLowerCase();
      const fieldName = mapFilingDocField(key);

      if (fieldName) {
        hasFiles = true;
        const name = doc.fileName || `${fieldName}.pdf`;
        const isPdf = name.toLowerCase().endsWith(".pdf");
        appendFilePart(formData, fieldName, {
          uri: doc.fileUri,
          name: name,
          type: isPdf ? "application/pdf" : "image/jpeg",
        });
      }
    }

    if (!hasFiles) return "No documents selected for upload";

    const cleanFilingId = String(filingId || "").trim();
    const url = `${resolveApiBaseUrl()}/api/v1/gst/filing/documents/${cleanFilingId}/update`;

    return executeXhrUpload(url, "PUT", formData, () =>
      gstFilingApi.uploadAllFilingDocuments(cleanFilingId, documents)
    );
  },

  uploadFilingDocument: async (
    filingId: string,
    documentType: string,
    fileUri: string,
    fileName: string
  ): Promise<string> => {
    const formData = new FormData();
    const fieldName = mapFilingDocField(documentType || "");

    appendFilePart(formData, fieldName, {
      uri: fileUri,
      name: fileName || `${fieldName}.pdf`,
      type: fileName?.toLowerCase().endsWith(".pdf") ? "application/pdf" : "image/jpeg",
    });

    const url = `${resolveApiBaseUrl()}/api/v1/gst/filing/documents/${filingId}/upload`;
    return executeXhrUpload(url, "POST", formData);
  },

  fetchFilings: async (gstin: string) => {
    return apiClient.get<any[]>(`/api/v1/gst/filing/${gstin}`);
  },
};

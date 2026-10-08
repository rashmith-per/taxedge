import { apiClient } from "../../../../core/api/apiClient";
import * as FileSystem from "expo-file-system";
import { TdsDocumentItem } from "../types/tdsDocuments.types";
import { INITIAL_TDS_DOCUMENTS } from "../constants/tdsDocuments.constants";
import { TdsDocumentsDto } from "./tdsApiTypes";
import { logger } from "../../../../core/logging/logger";

// Helper: Read file URI as Base64 string for REST JSON transport
export const readFileAsBase64 = async (uri?: string): Promise<string | null> => {
  if (!uri || typeof uri !== "string") return null;
  const cleanUri = uri.trim();
  if (!cleanUri) return null;

  if (cleanUri.startsWith("data:")) {
    const commaIdx = cleanUri.indexOf(",");
    return commaIdx !== -1 ? cleanUri.substring(commaIdx + 1) : null;
  }

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
      logger.warn("[tdsDocumentsApiService] Error fetching web URL as Base64", { error: err });
      return null;
    }
  }

  if (!cleanUri.startsWith("file:") && !cleanUri.startsWith("content:") && !cleanUri.startsWith("ph:") && !cleanUri.startsWith("/")) {
    return cleanUri;
  }

  try {
    const base64 = await FileSystem.readAsStringAsync(cleanUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    if (base64 && base64.trim().length > 0) {
      return base64.trim();
    }
  } catch (fsErr) {
    logger.debug("[tdsDocumentsApiService] Direct FileSystem read failed, attempting cache copy fallback", { error: fsErr });
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
      logger.warn("[tdsDocumentsApiService] Error reading file as Base64 fallback", { error: copyErr });
    }
  }

  return null;
};

export const tdsDocumentsApiService = {
  saveDocuments: async (documents: TdsDocumentItem[], tdsRefundId: string): Promise<string> => {
    const getDocBase64 = async (docKey: string): Promise<string | null> => {
      const key = docKey.toLowerCase();
      const doc = documents.find((d) => {
        const hasUri = d.status === "uploaded" || Boolean(d.fileUri) || Boolean((d as any).uri);
        if (!hasUri) return false;

        const id = (d.id || "").toLowerCase();
        const icon = (d.iconType || "").toLowerCase();
        const type = ((d as any).type || "").toLowerCase();
        const title = (d.title || "").toLowerCase();

        if (id === key || icon === key || type === key) return true;

        if (key === "pan") return (id.includes("pan") || icon.includes("pan") || title.includes("pan"));
        if (key === "form16") return (id === "form16" || icon === "form16" || (title.includes("form 16") && !title.includes("16a")));
        if (key === "form16a") return (id.includes("16a") || icon.includes("16a") || title.includes("16a"));
        if (key === "ais") return (id.includes("ais") || icon.includes("ais") || title.includes("ais"));
        if (key === "tis") return (id.includes("tis") || icon.includes("tis") || title.includes("tis"));
        if (key === "bank_statements") return (id.includes("bank") || icon.includes("bank") || title.includes("bank"));
        if (key === "prev_itr") return (id.includes("prev") || icon.includes("prev") || title.includes("previous"));
        if (key === "tds_certs") return (id.includes("tds_cert") || icon.includes("tds_cert") || title.includes("tds cert") || title.includes("deduction"));
        if (key === "income_proofs") return (id.includes("income") || icon.includes("income") || title.includes("income") || title.includes("supporting"));

        return false;
      });

      const targetUri = doc?.fileUri || (doc as any)?.uri;
      if (!doc || !targetUri) return null;
      return await readFileAsBase64(targetUri);
    };

    const [panFile, form16File, form16aFile, aisFile, tisFile, bankStatementsFile, prevItrFile, tdsCertsFile, incomeProofsFile] = await Promise.all([
      getDocBase64("pan"), getDocBase64("form16"), getDocBase64("form16a"), getDocBase64("ais"), getDocBase64("tis"), getDocBase64("bank_statements"), getDocBase64("prev_itr"), getDocBase64("tds_certs"), getDocBase64("income_proofs"),
    ]);

    const payload: TdsDocumentsDto = {
      tdsRefundId, panFile, form16File, form16aFile, aisFile, tisFile, bankStatementsFile, prevItrFile, tdsCertsFile, incomeProofsFile,
    };

    return await apiClient.post<string>("/itr/tds-documents/save", payload);
  },

  getDocuments: async (tdsRefundId: string): Promise<TdsDocumentsDto | null> => {
    try {
      return await apiClient.get<TdsDocumentsDto>(`/itr/tds-documents/${tdsRefundId}`);
    } catch (err) {
      logger.debug("[tdsDocumentsApiService] Documents fetch fallback to null", { tdsRefundId, error: err });
      return null;
    }
  },

  fetchAndMapDocumentsList: async (tdsRefundId: string, fallbackDocs: TdsDocumentItem[] = INITIAL_TDS_DOCUMENTS): Promise<TdsDocumentItem[]> => {
    const fetched = await tdsDocumentsApiService.getDocuments(tdsRefundId);
    if (!fetched) return fallbackDocs;

    const fileMap: Record<string, string | null | undefined> = {
      pan: fetched.panFile, form16: fetched.form16File, form16a: fetched.form16aFile, ais: fetched.aisFile, tis: fetched.tisFile, bank_statements: fetched.bankStatementsFile, prev_itr: fetched.prevItrFile, tds_certs: fetched.tdsCertsFile, income_proofs: fetched.incomeProofsFile,
    };

    return fallbackDocs.map((doc): TdsDocumentItem => {
      const base64Content = fileMap[doc.id];
      if (base64Content && base64Content.length > 0) {
        const mimeType = doc.allowedExtensions && doc.allowedExtensions.includes("pdf") ? "application/pdf" : "image/jpeg";
        const fileUri = base64Content.startsWith("data:") ? base64Content : `data:${mimeType};base64,${base64Content}`;

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
};

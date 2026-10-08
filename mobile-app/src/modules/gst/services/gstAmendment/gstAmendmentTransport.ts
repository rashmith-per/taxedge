import type { AmendmentFileInput } from "./gstAmendmentApi.types";
import { apiClient, SERVER_IP, SERVER_PORT } from "@/core/api/apiClient";
import { tokenManager } from "@/core/authentication/tokenManager";
import { useAuthStore } from "@/store/authStore";
import { logger } from "@/core/logging/logger";

export const formatFile = (file: AmendmentFileInput) => {
  if (!file) return undefined;
  if (file.uri) {
    return {
      uri: file.uri,
      name: file.name || "proof.jpg",
      type: file.name?.toLowerCase().endsWith(".pdf")
        ? "application/pdf"
        : "image/jpeg",
      // React Native's FormData accepts { uri, name, type } file parts; the DOM typings do not model them.
    } as any;
  }
  return file;
};

export const mapNatureOfPremises = (nature?: string): string => {
  const lower = (nature || "").toLowerCase();
  switch (true) {
    case lower.includes("lease"):
      return "LEASED";
    case lower.includes("rent"):
      return "RENTED";
    case lower.includes("consent"):
      return "CONSENT";
    case lower.includes("share"):
      return "SHARED";
    case lower.includes("own"):
      return "OWNED";
    default:
      return "OTHERS";
  }
};

// Utility for XHR Upload
export const uploadAmendmentWithFile = async <T = unknown>(
  endpoint: string,
  formData: FormData,
  onSuccess: (data: T) => void,
  onError: (error: unknown) => void,
  method: "POST" | "PUT" = "POST",
) => {
  try {
    const baseUrl =
      apiClient.getBaseUrl() || `http://${SERVER_IP}:${SERVER_PORT}`;
    const url = `${baseUrl}/api/v1/gst/amendments/${endpoint}`;
    logger.debug(`[gstAmendmentTransport] Submitting amendment via XHR (${method}) to:`, { endpoint, method });

    try {
      const authState = useAuthStore.getState();
      const custId =
        authState.customer?.customerId ||
        authState.authenticatedUser?.customerId ||
        authState.authenticatedUser?.custId ||
        (authState.customer as any)?.custId;
      if (custId && typeof custId === "string" && custId.trim() !== "") {
        formData.append("customerId", custId.trim());
      }
    } catch (err) {
      logger.debug("[gstAmendmentTransport] Customer ID resolution fallback", { error: err });
    }

    const token = await tokenManager.getAccessToken();

    const xhr = new XMLHttpRequest();
    xhr.open(method, url);

    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const parsed = JSON.parse(xhr.responseText);
          onSuccess(parsed);
        } catch {
          // Trust boundary: non-JSON replies are passed through as text, as before.
          onSuccess(xhr.responseText as T);
        }
      } else {
        onError(new Error(`API Error: ${xhr.status} ${xhr.responseText}`));
      }
    };

    xhr.onerror = () => {
      onError(new Error("Network request failed during amendment upload."));
    };

    xhr.send(formData);
  } catch (err) {
    onError(err);
  }
};

import type { AmendmentFileInput, AmendmentRecord, ExistingSignatoryDto } from "./gstAmendmentApi.types";
import { apiClient } from "@/core/api/apiClient";
import { uploadAmendmentWithFile, formatFile } from "./gstAmendmentTransport";

/** Authorised Signatories amendment endpoints. */
export const signatoryAmendmentApi = {
  getExistingSignatory: (gstId: string) => {
    return apiClient.get<ExistingSignatoryDto>(`/api/v1/gst/amendments/signatory/${gstId}/existing`);
  },
  submitSignatoryAmendment: (
    gstId: string,
    signatoryName: string,
    signatoryPan: string,
    file: AmendmentFileInput,
    signatoryDob?: string,
    designation?: string,
    signatoryMobile?: string,
    signatoryEmail?: string,
  ): Promise<AmendmentRecord> => {
    return new Promise<AmendmentRecord>((resolve, reject) => {
      const formData = new FormData();
      formData.append("newSignatoryName", signatoryName);
      formData.append("newSignatoryPan", signatoryPan);

      if (signatoryDob) {
        const separator = signatoryDob.includes("-") ? "-" : "/";
        const parts = signatoryDob.split(separator);
        switch (parts.length) {
          case 3:
            const d = parts[0].padStart(2, "0");
            const m = parts[1].padStart(2, "0");
            const y = parts[2];
            formData.append("newSignatoryDob", `${y}-${m}-${d}`);
            break;
          default:
            formData.append("newSignatoryDob", signatoryDob);
            break;
        }
      }

      if (designation) {
        formData.append("newDesignation", designation);
        formData.append("newSignatoryDesignation", designation);
        formData.append("designation", designation);
      }
      if (signatoryMobile) formData.append("newSignatoryMobile", signatoryMobile);
      if (signatoryEmail) formData.append("newSignatoryEmail", signatoryEmail);

      formData.append("file", formatFile(file));
      uploadAmendmentWithFile<AmendmentRecord>(
        `signatory/${gstId}`,
        formData,
        resolve,
        reject,
        "POST",
      );
    });
  },
  getSignatoryAmendmentById: (id: number | string) => {
    return apiClient.get<AmendmentRecord>(`/api/v1/gst/amendments/signatory/record/${id}`);
  },
  updateSignatoryAmendment: (
    id: number | string,
    signatoryName: string,
    signatoryPan: string,
    file?: AmendmentFileInput,
    signatoryDob?: string,
    designation?: string,
    signatoryMobile?: string,
    signatoryEmail?: string,
  ): Promise<AmendmentRecord> => {
    return new Promise<AmendmentRecord>((resolve, reject) => {
      const formData = new FormData();
      formData.append("newSignatoryName", signatoryName);
      formData.append("newSignatoryPan", signatoryPan);

      if (signatoryDob) {
        const separator = signatoryDob.includes("-") ? "-" : "/";
        const parts = signatoryDob.split(separator);
        switch (parts.length) {
          case 3:
            const d = parts[0].padStart(2, "0");
            const m = parts[1].padStart(2, "0");
            const y = parts[2];
            formData.append("newSignatoryDob", `${y}-${m}-${d}`);
            break;
          default:
            formData.append("newSignatoryDob", signatoryDob);
            break;
        }
      }

      if (designation) {
        formData.append("newDesignation", designation);
        formData.append("newSignatoryDesignation", designation);
        formData.append("designation", designation);
      }
      if (signatoryMobile) formData.append("newSignatoryMobile", signatoryMobile);
      if (signatoryEmail) formData.append("newSignatoryEmail", signatoryEmail);

      if (file) formData.append("file", formatFile(file));
      uploadAmendmentWithFile<AmendmentRecord>(
        `signatory/record/${id}`,
        formData,
        resolve,
        reject,
        "PUT",
      );
    });
  },
};

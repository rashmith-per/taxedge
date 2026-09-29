import { apiClient } from "../../../core/api/apiClient";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function parseDateToISO(dateStr: string): string | null {
  if (!dateStr) return null;
  const parts = dateStr.trim().split(" ");
  if (parts.length === 3) {
    const d = parts[0].padStart(2, "0");
    const m = String(MONTHS.indexOf(parts[1]) + 1).padStart(2, "0");
    const y = parts[2];
    if (m !== "00") return `${y}-${m}-${d}`; // Returns YYYY-MM-DD
  }

  // fallback if already ISO or different format
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split("T")[0];
  }
  return null;
}

export const gstComplianceApi = {
  createCompliance: async (data: any) => {
    const formData = new FormData();

    // Build DTO
    const dto = {
      gstin: data.gstin || "29AAAAA0000A1Z5", // fallback if undefined
      financialYear: data.financialYear || "2023-24",
      requestType:
        data.requestType === "Reconciliation Support"
          ? "RECONCILIATION_SUPPORT"
          : "NOTICE_RESPONSE",
      gstr2bNumber: data.gstr2bRef?.trim() ? data.gstr2bRef : "NOT_PROVIDED",
      noticeNumber: data.noticeNumber || "",
      noticeIssueDate: parseDateToISO(data.noticeIssueDate),
      replyDueDate: parseDateToISO(data.replyDueDate),
      message:
        data.requestType === "Reconciliation Support"
          ? data.reconciliationRemarks || ""
          : data.noticeRemarks || "",
    };

    formData.append("data", JSON.stringify(dto));

    if (data.purchaseDoc?.uri) {
      formData.append("reconciliationFile1", {
        uri: data.purchaseDoc.uri,
        name: data.purchaseDoc.name || "recon1.pdf",
        type: data.purchaseDoc.name?.toLowerCase().endsWith(".pdf")
          ? "application/pdf"
          : "image/jpeg",
      } as any);
    }

    if (data.salesDoc?.uri) {
      formData.append("reconciliationFile2", {
        uri: data.salesDoc.uri,
        name: data.salesDoc.name || "recon2.pdf",
        type: data.salesDoc.name?.toLowerCase().endsWith(".pdf")
          ? "application/pdf"
          : "image/jpeg",
      } as any);
    }

    if (data.noticeDoc?.uri) {
      formData.append("noticeFile", {
        uri: data.noticeDoc.uri,
        name: data.noticeDoc.name || "notice.pdf",
        type: data.noticeDoc.name?.toLowerCase().endsWith(".pdf")
          ? "application/pdf"
          : "image/jpeg",
      } as any);
    }

    const baseUrl = apiClient.getBaseUrl();
    if (!baseUrl) {
      throw new Error(
        "Backend URL is not configured. Set the API URL before submitting GST compliance data.",
      );
    }
    const url = `${baseUrl}/gst/compliance/create`;

    return new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", url);

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.responseText);
        } else {
          reject(
            new Error(
              "Compliance upload failed: " +
                xhr.status +
                " " +
                xhr.responseText,
            ),
          );
        }
      };

      xhr.onerror = () =>
        reject(new Error("Network error during Compliance upload"));

      xhr.send(formData);
    });
  },
};

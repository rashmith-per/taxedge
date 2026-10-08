/**
 * Service: GST Compliance
 * Manages compliance request persistence, local application store sync, and notifications.
 */

import { useApplicationStore } from "@/store/applicationStore";
import { useNotificationStore } from "@/store/notificationStore";
import { ComplianceFormData } from "@/modules/gst/validation/complianceSchema";
import {
  generateComplianceRefId,
  getTodayFormatted,
} from "@/modules/gst/utils/gstValidation";
import { gstComplianceApi } from "@/modules/gst/services/gstComplianceApi";
import { getErrorMessage } from "@/core/error-handling/errorMessage";
import { logger } from "@/core/logging/logger";

export interface StructuredCompliancePayload {
  service: "GST_COMPLIANCE";
  requestType: "RECONCILIATION_SUPPORT" | "NOTICE_RESPONSE";
  financialYear: string;
  gstin: string;
  documents: Array<{
    category: string;
    name: string;
    uri: string;
    sizeFormatted: string;
  }>;
  noticeNumber?: string;
  noticeIssueDate?: string;
  replyDueDate?: string;
  gstr2bRef?: string;
  remarks?: string;
  submittedAt: string;
  referenceId: string;
}

export interface SubmissionResult {
  success: boolean;
  referenceId: string;
  submittedAt: string;
  estimatedResponse: string;
  error?: string;
}

/**
 * Transforms form state into structured production payload
 */
export function buildCompliancePayload(
  data: ComplianceFormData,
  refId: string,
): StructuredCompliancePayload {
  const isRecon = data.requestType === "Reconciliation Support";
  const docs: StructuredCompliancePayload["documents"] = [];

  if (isRecon) {
    if (data.purchaseDoc) {
      docs.push({
        category: "Purchase Register",
        name: data.purchaseDoc.name,
        uri: data.purchaseDoc.uri,
        sizeFormatted: data.purchaseDoc.sizeFormatted,
      });
    }
    if (data.salesDoc) {
      docs.push({
        category: "Sales Register",
        name: data.salesDoc.name,
        uri: data.salesDoc.uri,
        sizeFormatted: data.salesDoc.sizeFormatted,
      });
    }
  } else {
    if (data.noticeDoc) {
      docs.push({
        category: "Notice Copy",
        name: data.noticeDoc.name,
        uri: data.noticeDoc.uri,
        sizeFormatted: data.noticeDoc.sizeFormatted,
      });
    }
  }

  return {
    service: "GST_COMPLIANCE",
    requestType: isRecon ? "RECONCILIATION_SUPPORT" : "NOTICE_RESPONSE",
    financialYear: data.financialYear,
    gstin: data.gstin,
    documents: docs,
    noticeNumber: !isRecon ? data.noticeNumber : undefined,
    noticeIssueDate: !isRecon ? data.noticeIssueDate : undefined,
    replyDueDate: !isRecon ? data.replyDueDate : undefined,
    gstr2bRef: isRecon && data.gstr2bRef ? data.gstr2bRef : undefined,
    remarks: isRecon ? data.reconciliationRemarks : data.noticeRemarks,
    submittedAt: getTodayFormatted(),
    referenceId: refId,
  };
}

/**
 * Submits the compliance request, records application & notification in store
 */
export async function submitComplianceRequest(
  data: ComplianceFormData,
  existingComplianceId?: string | null,
): Promise<SubmissionResult> {
  const referenceId = generateComplianceRefId();
  const submittedAt = getTodayFormatted();
  const estimatedResponse = "Within 24 Hours";

  try {
    const payload = buildCompliancePayload(data, referenceId);
    let resolvedId = existingComplianceId || null;

    if (!resolvedId) {
      // 1. Call Spring Boot backend API to store in database if not already saved
      const backendResponse: any = await gstComplianceApi.createCompliance(data);
      logger.debug("[GST] Compliance API Response received", { hasResponse: !!backendResponse });

      let parsedId = null;
      try {
        const parsed = typeof backendResponse === "string" ? JSON.parse(backendResponse) : backendResponse;
        parsedId = parsed?.complianceId;
      } catch (parseErr) {
        logger.debug("[GST] JSON parse fallback for complianceId", { error: parseErr });
        const match = String(backendResponse).match(/Compliance ID:\s*([A-Za-z0-9_-]+)/i);
        parsedId = match ? match[1] : null;
      }
      resolvedId = parsedId || referenceId;
    }

    // 2. Save to centralized application store
    useApplicationStore.getState().createApplication(
      "gst-compliance",
      `GST Compliance - ${data.requestType}`,
      "GST",
      {
        service: payload.service,
        requestType: data.requestType,
        financialYear: payload.financialYear,
        gstin: payload.gstin,
        referenceId: resolvedId,
        submittedAt: payload.submittedAt,
        estimatedResponse,
        ...(payload.noticeNumber ? { noticeNumber: payload.noticeNumber } : {}),
        ...(payload.noticeIssueDate
          ? { noticeIssueDate: payload.noticeIssueDate }
          : {}),
        ...(payload.replyDueDate ? { replyDueDate: payload.replyDueDate } : {}),
        ...(payload.gstr2bRef ? { gstr2bRef: payload.gstr2bRef } : {}),
        ...(payload.remarks ? { remarks: payload.remarks } : {}),
      },
      payload.documents.map((d) => d.name),
      0,
    );

    // 3. Add notification
    useNotificationStore
      .getState()
      .addNotification(
        "GST Compliance Request Submitted",
        `Your request (${data.requestType}) for ${data.gstin} has been submitted. Reference: ${resolvedId}`,
        "gst",
      );

    return {
      success: true,
      referenceId: resolvedId || referenceId,
      submittedAt,
      estimatedResponse,
    };
  } catch (err) {
    return {
      success: false,
      referenceId: "",
      submittedAt: "",
      estimatedResponse: "",
      error: getErrorMessage(err) || "Failed to submit request. Please try again.",
    };
  }
}

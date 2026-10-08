/**
 * GST Filing Step Submission Handlers
 * Encapsulates backend submission, document upload, and flow transitions for each step.
 */

import { Alert } from "react-native";
import { gstApi } from "@/modules/gst/services/gstApi";
import { useApplicationStore } from "@/store/applicationStore";
import { FilingDocItem } from "@/modules/gst/gst-filing/config/gstFilingDocumentsConfig";
import { GstFilingPeriodData } from "@/modules/gst/gst-filing/components/GstFilingPeriodStep/GstFilingPeriodStep";
import {
  getResolvedCustomerId,
  buildFilingPayload,
  extractUploadedDocumentNames,
} from "@/modules/gst/gst-filing/hooks/gstFilingHelpers";
import { getErrorMessage } from "@/core/error-handling/errorMessage";
import { logger } from "@/core/logging/logger";

export async function submitPeriodStep({
  periodData,
  targetFilingId,
  isEditMode,
  setFilingId,
  setCurrentStep,
  setIsEditMode,
  setIsSubmitting,
}: {
  periodData: GstFilingPeriodData;
  targetFilingId: string;
  isEditMode: boolean;
  setFilingId: (id: string) => void;
  setCurrentStep: (step: number) => void;
  setIsEditMode: (val: boolean) => void;
  setIsSubmitting: (val: boolean) => void;
}): Promise<void> {
  setIsSubmitting(true);
  try {
    const custId = await getResolvedCustomerId();
    const payload = buildFilingPayload(periodData, custId);

    if (targetFilingId) {
      try {
        await gstApi.updateFiling(targetFilingId, payload);
        setFilingId(targetFilingId);
        if (isEditMode) {
          Alert.alert("Success", "Filing period details updated successfully.");
          setIsEditMode(false);
          setCurrentStep(2);
          return;
        }
        setCurrentStep(1);
        return;
      } catch (updateErr) {
        const errMsg = String(getErrorMessage(updateErr) || updateErr || "");
        if (
          errMsg.includes("does not belong to GSTIN") ||
          errMsg.includes("not found with ID")
        ) {
          logger.debug("[FilingFlow] Target filing ID does not belong to GSTIN, creating new session", { targetFilingId, gstin: periodData.gstin });
        } else {
          throw updateErr;
        }
      }
    }

    if (!payload.customerId) {
      Alert.alert(
        "Authentication Notice",
        "Customer profile session not found. Please re-login to proceed with filing.",
      );
      return;
    }

    const response = await gstApi.createFiling(payload);
    const responseStr =
      typeof response === "string" ? response : JSON.stringify(response);
    const match = responseStr.match(/Filing ID:\s*([A-Za-z0-9_-]+)/i);

    let resolvedId = match ? match[1] : "";
    if (!resolvedId) {
      const filings = await gstApi.fetchFilings(periodData.gstin);
      if (filings && filings.length > 0) {
        const sortedFilings = [...filings].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
        const latest = sortedFilings[sortedFilings.length - 1];
        resolvedId = latest.gstfilingId || latest.id || "";
      }
    }

    if (resolvedId) {
      setFilingId(resolvedId);
    }
    if (isEditMode) {
      setIsEditMode(false);
      setCurrentStep(2);
      return;
    }
    setCurrentStep(1);
  } catch (err) {
    Alert.alert(
      "Filing Notice",
      getErrorMessage(err) || "Failed to update filing details. Please try again.",
    );
  } finally {
    setIsSubmitting(false);
  }
}

export async function submitDocumentsStep({
  targetFilingId: initialTargetId,
  periodData,
  documents,
  isEditMode,
  setFilingId,
  setDocuments,
  setCurrentStep,
  setIsEditMode,
  setIsSubmitting,
}: {
  targetFilingId: string;
  periodData: GstFilingPeriodData;
  documents: FilingDocItem[];
  isEditMode: boolean;
  setFilingId: (id: string) => void;
  setDocuments: React.Dispatch<React.SetStateAction<FilingDocItem[]>>;
  setCurrentStep: (step: number) => void;
  setIsEditMode: (val: boolean) => void;
  setIsSubmitting: (val: boolean) => void;
}): Promise<void> {
  let targetFilingId = initialTargetId;

  if (!targetFilingId) {
    try {
      const custId = await getResolvedCustomerId();
      const payload = buildFilingPayload(periodData, custId);
      const response = await gstApi.createFiling(payload);
      const responseStr =
        typeof response === "string" ? response : JSON.stringify(response);
      const match = responseStr.match(/Filing ID:\s*([A-Za-z0-9_-]+)/i);
      if (match && match[1]) {
        targetFilingId = match[1];
        setFilingId(targetFilingId);
      }
    } catch (createErr) {
      logger.debug("[DocumentStep] Auto-creation of filing session failed:", { error: createErr });
    }
  }

  if (!targetFilingId) {
    Alert.alert(
      "Notice",
      "Filing session not found. Please review period details first.",
    );
    setCurrentStep(0);
    return;
  }

  const isNilReturn = periodData.filingNature === "Nil Return";
  switch (isNilReturn ? "NIL" : "REGULAR") {
    case "REGULAR": {
      const missingMandatory = documents.filter((d) => d.required && !d.fileUri);
      if (missingMandatory.length > 0) {
        const missingNames = missingMandatory.map((d) => d.name).join("\n• ");
        Alert.alert(
          "Required Documents Missing",
          `Please upload all required documents before proceeding:\n\n• ${missingNames}`,
          [{ text: "OK" }],
        );
        return;
      }
      break;
    }
    case "NIL":
    default:
      break;
  }

  setIsSubmitting(true);
  try {
    const docsToUpload = documents.filter((d) => d.fileUri);
    if (docsToUpload.length > 0) {
      if (isEditMode) {
        await gstApi.updateAllFilingDocuments(targetFilingId, docsToUpload);
        Alert.alert("Success", "Filing documents updated successfully.");
      } else {
        await gstApi.uploadAllFilingDocuments(targetFilingId, docsToUpload);
      }
      docsToUpload.forEach((d) => ((d as any).uploadedToBackend = true));
      setDocuments([...documents]);
    }
    if (isEditMode) {
      setIsEditMode(false);
    }
    setCurrentStep(2);
  } catch (uploadErr) {
    Alert.alert(
      "Upload Failed",
      getErrorMessage(uploadErr) || "Failed to upload documents. Please try again.",
    );
  } finally {
    setIsSubmitting(false);
  }
}

export async function submitReviewStep({
  missingDocsCount,
  filingId,
  periodData,
  setCurrentStep,
  setIsSubmitting,
}: {
  missingDocsCount: number;
  filingId: string | null;
  periodData: GstFilingPeriodData;
  setCurrentStep: (step: number) => void;
  setIsSubmitting: (val: boolean) => void;
}): Promise<void> {
  const isNilReturn = periodData.filingNature === "Nil Return";
  switch (isNilReturn ? "NIL" : "REGULAR") {
    case "REGULAR": {
      if (missingDocsCount > 0) {
        Alert.alert(
          "Documents Missing",
          `You have ${missingDocsCount} missing required document(s). Please upload all required documents before submitting your return.`,
          [
            { text: "Cancel", style: "cancel" },
            { text: "Upload Now", onPress: () => setCurrentStep(1) },
          ],
        );
        return;
      }
      break;
    }
    case "NIL":
    default:
      break;
  }

  const hasEstimates =
    periodData.calculationMethod === "manual_estimates" ||
    Boolean(
      (periodData.taxableSales && String(periodData.taxableSales).trim() !== "" && String(periodData.taxableSales).trim() !== "0") ||
      (periodData.taxablePurchases && String(periodData.taxablePurchases).trim() !== "" && String(periodData.taxablePurchases).trim() !== "0") ||
      (periodData.eligibleItc && String(periodData.eligibleItc).trim() !== "" && String(periodData.eligibleItc).trim() !== "0")
    );

  if (filingId && hasEstimates) {
    setIsSubmitting(true);
    try {
      const custId = await getResolvedCustomerId();
      const payload = buildFilingPayload(periodData, custId, true);
      await gstApi.updateFiling(filingId, payload);
    } catch (err) {
      logger.debug("[ReviewStep] Update manual estimates notice:", { error: err });
    } finally {
      setIsSubmitting(false);
    }
  }
  setCurrentStep(3);
}

export function promptPayLaterSubmission({
  periodData,
  selectedMethod,
  filingId,
  documents,
  setCreatedAppId,
  clearGstFilingDraft,
  setIsSubmitting,
  setCurrentStep,
}: {
  periodData: GstFilingPeriodData;
  selectedMethod: string;
  filingId: string | null;
  documents: FilingDocItem[];
  setCreatedAppId: (id: string) => void;
  clearGstFilingDraft: () => void;
  setIsSubmitting: (val: boolean) => void;
  setCurrentStep: (step: number) => void;
}): void {
  Alert.alert(
    "Payment Gateway Unavailable",
    "Online payment processing is currently unavailable on this system. Would you like to submit your filing request for CA review and complete payment later?",
    [
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => setIsSubmitting(false),
      },
      {
        text: "Submit (Pay Later)",
        onPress: () => {
          const periodLabel =
            periodData.filingPeriod ||
            periodData.filingMonth ||
            "Current Period";
          const hasEstimates =
            periodData.calculationMethod === "manual_estimates" ||
            Boolean(
              (periodData.taxableSales && String(periodData.taxableSales).trim() !== "" && String(periodData.taxableSales).trim() !== "0") ||
              (periodData.taxablePurchases && String(periodData.taxablePurchases).trim() !== "" && String(periodData.taxablePurchases).trim() !== "0") ||
              (periodData.eligibleItc && String(periodData.eligibleItc).trim() !== "" && String(periodData.eligibleItc).trim() !== "0")
            );
          const newAppId = useApplicationStore.getState().createApplication(
            "gst-filing",
            `GST Filing (${periodLabel})`,
            "GST",
            {
              gstin: periodData.gstin,
              businessName:
                periodData.tradeName ||
                periodData.businessName ||
                "Registered Business",
              filingPeriod: periodLabel,
              filingType: periodData.filingType || "GSTR-1",
              filingNature: periodData.filingNature || "Regular Return",
              financialYear: periodData.financialYear || "FY 2025-26",
              paymentStatus: "Payment Pending",
              paymentMethod: selectedMethod.toUpperCase(),
              filingId: filingId || undefined,
              taxableSales: periodData.taxableSales || periodData.turnover || "0",
              taxablePurchases: periodData.taxablePurchases || "0",
              eligibleItc: periodData.eligibleItc || "0",
              calculationMethod:
                periodData.calculationMethod ||
                (hasEstimates ? "manual_estimates" : "ca_assisted"),
            },
            extractUploadedDocumentNames(documents),
            0,
            "Pending",
            false,
            filingId || undefined,
          );
          setCreatedAppId(newAppId);
          clearGstFilingDraft();
          setIsSubmitting(false);
          setCurrentStep(6);
        },
      },
    ],
  );
}

/**
 * Custom Hook: useGstFiling
 * Manages the multi-step GST Filing workflow, state synchronization,
 * REST API persistence, drafts, and step progression.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { GstValidators } from "@/modules/gst/utils/gstValidators";
import { useUniversalDraftGuard } from "@/shared/hooks/useUniversalDraftGuard";
import { useApplicationStore } from "@/store/applicationStore";
import { gstApi } from "@/modules/gst/services/gstApi";
import { logger } from "@/core/logging/logger";
import { useGstFilingForm } from "@/modules/gst/gst-filing/hooks/useGstFilingForm";
import { useGstFilingRestore } from "@/modules/gst/gst-filing/hooks/useGstFilingRestore";
import {
  mapDtoToPeriodData,
  mapDtoToFilingDocuments,
  resolveTargetFilingId,
} from "@/modules/gst/gst-filing/hooks/gstFilingHelpers";
import {
  submitPeriodStep,
  submitDocumentsStep,
  submitReviewStep,
  promptPayLaterSubmission,
} from "@/modules/gst/gst-filing/hooks/gstFilingStepHandlers";
import { GstFilingPeriodData } from "@/modules/gst/gst-filing/components/GstFilingPeriodStep/GstFilingPeriodStep";
import { getErrorMessage } from "@/core/error-handling/errorMessage";

export function useGstFiling() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    appId?: string;
    step?: string;
    filingId?: string;
    id?: string;
  }>();

  const [currentStep, setCurrentStep] = useState(0);
  const [filingId, setFilingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdAppId, setCreatedAppId] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  const handleEditStep = useCallback((stepIndex: number) => {
    setIsEditMode(true);
    setCurrentStep(stepIndex);
  }, []);

  const {
    periodData,
    setPeriodData,
    periodErrors,
    setPeriodErrors,
    documents,
    setDocuments,
    validatePeriodStep,
    validateDocumentsStep,
    handleUpdateDocuments,
    requiredDocs,
    missingDocsCount,
    uploadedDocsCount,
  } = useGstFilingForm(createdAppId);

  // Payment State
  const [selectedMethod, setSelectedMethod] = useState("upi");
  const [upiId, setUpiId] = useState("");
  const [upiError, setUpiError] = useState("");

  // Store access
  const gstFilingDraft = useApplicationStore((state) => state.gstFilingDraft);
  const saveGstFilingDraft = useApplicationStore((state) => state.saveGstFilingDraft);
  const clearGstFilingDraft = useApplicationStore((state) => state.clearGstFilingDraft);

  // Universal Draft Guard Hook
  const {
    showDraftModal,
    handleSaveAndExit,
    handleDiscardAndExit,
    handleCancel,
  } = useUniversalDraftGuard({
    isDirty: () =>
      Boolean(
        periodData.periodType ||
          periodData.financialYear ||
          periodData.filingPeriod ||
          periodData.filingMonth ||
          periodData.gstin ||
          periodData.filingType ||
          documents.some((d) => Boolean(d.fileUri)),
      ),
    onSaveDraft: () => {
      saveGstFilingDraft({
        id: "gst-filing-draft",
        stepIndex: currentStep,
        periodData,
        documents,
        createdFilingId: filingId || undefined,
        updatedAt: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    },
    onDiscardDraft: () => {
      clearGstFilingDraft();
    },
    isSubmitted: () => currentStep >= 4,
  });

  // Restore existing application or draft on mount
  useGstFilingRestore({
    params,
    setFilingId,
    setCreatedAppId,
    setCurrentStep,
    setPeriodData,
    setDocuments,
  });

  const [isFetchingReview, setIsFetchingReview] = useState<boolean>(false);
  const lastFetchedReviewIdRef = useRef<string | null>(null);
  const periodDataRef = useRef(periodData);
  periodDataRef.current = periodData;
  const filingIdRef = useRef(filingId);
  filingIdRef.current = filingId;

  const filingGstinRef = useRef<string | null>(null);

  // Bind filingId to its associated GSTIN
  useEffect(() => {
    if (filingId && periodData.gstin) {
      filingGstinRef.current = periodData.gstin.trim().toUpperCase();
    }
  }, [filingId, periodData.gstin]);

  // If user modifies GSTIN, ensure previous filing ID belonging to other GSTIN is reset
  useEffect(() => {
    const clean = periodData.gstin ? periodData.gstin.trim().toUpperCase() : "";
    if (clean && filingGstinRef.current && clean !== filingGstinRef.current) {
      logger.debug(`[Filing] GSTIN changed. Resetting filing session.`, { previousGstin: filingGstinRef.current, newGstin: clean });
      setFilingId(null);
      filingGstinRef.current = null;
    }
  }, [periodData.gstin]);

  const getTargetFilingId = useCallback(
    (explicitId?: string): string => {
      return resolveTargetFilingId([
        explicitId,
        filingIdRef.current,
        params.filingId,
        params.id,
        params.appId?.startsWith("FIL") ? params.appId : undefined,
      ]);
    },
    [params.appId, params.filingId, params.id],
  );

  // Fetch persisted filing data from backend
  const fetchFilingDetails = useCallback(
    async (idToFetch?: string) => {
      const targetId = getTargetFilingId(idToFetch);

      if (!targetId) return;

      setIsFetchingReview(true);
      try {
        const dbFiling = await gstApi.getFilingById(targetId);
        if (dbFiling) {
          const mapped = mapDtoToPeriodData(dbFiling);
          setPeriodData((prev) => {
            const next: GstFilingPeriodData = {
              ...prev,
              filingId: targetId,
            };
            for (const [k, v] of Object.entries(mapped)) {
              if (v !== undefined && v !== null && v !== "") {
                (next as any)[k] = v;
              }
            }
            return next;
          });
          setFilingId(targetId);
        }
      } catch (err) {
        logger.warn("[useGstFiling] Could not retrieve GST filing details from DB:", { error: getErrorMessage(err) || err });
      }

      try {
        const dbDocs = await gstApi.getFilingDocuments(targetId);
        if (dbDocs) {
          setDocuments((prev) => mapDtoToFilingDocuments(dbDocs, prev));
        }
      } catch (docErr) {
        logger.debug("[useGstFiling] No documents found in DB for filing ID", { targetId, error: docErr });
      } finally {
        setIsFetchingReview(false);
      }
    },
    [getTargetFilingId, setPeriodData, setDocuments],
  );

  // Automatically retrieve from database when entering Review step (currentStep === 2)
  useEffect(() => {
    if (currentStep === 2) {
      const activeId = getTargetFilingId();
      if (activeId && lastFetchedReviewIdRef.current === activeId) {
        return;
      }
      lastFetchedReviewIdRef.current = activeId || "fetched";
      fetchFilingDetails(activeId);
    } else {
      lastFetchedReviewIdRef.current = null;
    }
  }, [currentStep, fetchFilingDetails, getTargetFilingId]);

  const getScreenTitle = useCallback(() => {
    switch (currentStep) {
      case 0:
        return "GST Filing Period";
      case 1:
        return "Filing Documents";
      case 2:
        return "Filing Review & Computation";
      case 3:
        return "Complete Payment";
      case 4:
        return "Payment Successful";
      case 5:
        return "Payment Receipt";
      default:
        return "Application Status";
    }
  }, [currentStep]);

  const getButtonText = useCallback(() => {
    if (isEditMode && (currentStep === 0 || currentStep === 1)) {
      return "Update & Review";
    }
    switch (currentStep) {
      case 0:
        return "Continue to Documents";
      case 1:
        return "Continue to Review";
      case 2:
        return "Proceed to Submit →";
      case 3:
        return "Confirm & Pay";
      default:
        return "";
    }
  }, [currentStep, isEditMode]);

  const validatePaymentStep = useCallback((): boolean => {
    if (selectedMethod === "upi") {
      if (!GstValidators.isValidUpi(upiId)) {
        setUpiError("Enter a valid UPI ID (e.g. yourname@bank / mobile@upi)");
        Alert.alert(
          "Invalid UPI ID",
          "Please enter a valid UPI ID to complete payment.",
        );
        return false;
      }
    }
    setUpiError("");
    return true;
  }, [selectedMethod, upiId]);

  const handleBack = useCallback(() => {
    if (isEditMode) {
      setIsEditMode(false);
      setCurrentStep(2);
      return;
    }
    if (currentStep === 6 || currentStep === 4) {
      router.back();
    } else if (currentStep === 5) {
      setCurrentStep(4);
    } else if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else {
      router.back();
    }
  }, [currentStep, router, isEditMode]);

  const handleContinue = useCallback(async () => {
    switch (currentStep) {
      case 0: {
        if (!validatePeriodStep()) return;
        await submitPeriodStep({
          periodData,
          targetFilingId: getTargetFilingId(),
          isEditMode,
          setFilingId,
          setCurrentStep,
          setIsEditMode,
          setIsSubmitting,
        });
        break;
      }

      case 1: {
        if (!validateDocumentsStep()) return;
        await submitDocumentsStep({
          targetFilingId: getTargetFilingId(),
          periodData,
          documents,
          isEditMode,
          setFilingId,
          setDocuments,
          setCurrentStep,
          setIsEditMode,
          setIsSubmitting,
        });
        break;
      }

      case 2: {
        await submitReviewStep({
          missingDocsCount,
          filingId,
          periodData,
          setCurrentStep,
          setIsSubmitting,
        });
        break;
      }

      case 3: {
        if (!validatePaymentStep()) return;
        setIsSubmitting(true);
        promptPayLaterSubmission({
          periodData,
          selectedMethod,
          filingId,
          documents,
          setCreatedAppId,
          clearGstFilingDraft,
          setIsSubmitting,
          setCurrentStep,
        });
        break;
      }

      default:
        break;
    }
  }, [
    currentStep,
    validatePeriodStep,
    validateDocumentsStep,
    validatePaymentStep,
    periodData,
    filingId,
    documents,
    missingDocsCount,
    selectedMethod,
    setDocuments,
    clearGstFilingDraft,
    getTargetFilingId,
    isEditMode,
  ]);

  return {
    currentStep,
    setCurrentStep,
    isSubmitting,
    periodData,
    setPeriodData,
    periodErrors,
    setPeriodErrors,
    documents,
    selectedMethod,
    setSelectedMethod,
    upiId,
    setUpiId,
    upiError,
    setUpiError,
    createdAppId,
    filingId,
    showDraftModal,
    handleSaveAndExit,
    handleDiscardAndExit,
    handleCancel,
    getScreenTitle,
    getButtonText,
    handleBack,
    handleContinue,
    handleUpdateDocuments,
    requiredDocs,
    missingDocsCount,
    uploadedDocsCount,
    validateDocumentsStep,
    isEditMode,
    handleEditStep,
    isFetchingReview,
    fetchFilingDetails,
  };
}

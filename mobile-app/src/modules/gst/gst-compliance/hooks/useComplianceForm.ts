import { useState, useEffect, useCallback, useRef } from "react";
import { Alert, Keyboard } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ComplianceFormData,
  ValidationErrors,
  validateComplianceForm,
} from "@/modules/gst/validation/complianceSchema";
import {
  cleanGstinInput,
  validateGstinLive,
} from "@/modules/gst/utils/gstValidation";
import { finalizeTrim } from "@/modules/gst/utils/gstSpaceValidation";
import { gstComplianceApi } from "@/modules/gst/services/gstComplianceApi";
import { executeComplianceSubmission } from "./useComplianceSubmissionAction";
import { useAuthStore } from "@/store/authStore";
import { useUniversalDraftGuard } from "@/shared/hooks/useUniversalDraftGuard";
import { parseCreatedComplianceId, sanitizeComplianceSaveError } from "../utils/complianceResponse";
import { logger } from "@/core/logging/logger";
import {
  getComplianceDraftKey,
  readComplianceDraft,
  saveComplianceDraft,
  clearComplianceDraft,
} from "./useComplianceDraftStorage";

export interface UseComplianceFormOptions {
  onValidationError?: (firstField: string) => void;
}

const FIELD_ORDER: (keyof ValidationErrors)[] = [
  "gstin", "financialYear", "requestType", "noticeNumber", "noticeIssueDate", "replyDueDate",
  "purchaseDoc", "salesDoc", "noticeDoc", "gstr2bRef", "reconciliationRemarks", "noticeRemarks",
];

const initialFormData: ComplianceFormData = {
  gstin: "", financialYear: "", requestType: "",
  purchaseDoc: null, salesDoc: null, noticeDoc: null,
  gstr2bRef: "", reconciliationRemarks: "",
  noticeNumber: "", noticeIssueDate: "", replyDueDate: "", noticeRemarks: "",
};

function getCleanMobile(): string {
  const authState = useAuthStore.getState();
  const mobile =
    authState.customer?.mobile ||
    authState.authenticatedUser?.mobileNumber ||
    authState.mobileNumber;
  return mobile ? String(mobile).replace(/\D/g, "") : "";
}

export function useComplianceForm(options?: UseComplianceFormOptions) {
  const router = useRouter();
  const params = useLocalSearchParams<{ step?: string; resume?: string }>();

  const [currentStep, setCurrentStep] = useState<number>(0); // 0 = Form, 1 = Review
  const [hasEnteredReview, setHasEnteredReview] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editSection, setEditSection] = useState<string | null>(null);
  const [formData, setFormData] = useState<ComplianceFormData>(initialFormData);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [complianceId, setComplianceId] = useState<string | null>(null);
  const [dbReviewData, setDbReviewData] = useState<any>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [hasCheckedDraft, setHasCheckedDraft] = useState<boolean>(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState<boolean>(false);

  const isMountedRef = useRef<boolean>(true);
  const activeSaveIdRef = useRef<string | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Check if draft exists on mount and silently restore without popup
  useEffect(() => {
    if (!hasCheckedDraft) {
      const checkDraft = async () => {
        const mobile = getCleanMobile();
        const saved = await readComplianceDraft(mobile);
        if (saved?.formData) {
          const fData = saved.formData;
          if (
            fData.gstin || fData.financialYear || fData.requestType ||
            fData.purchaseDoc || fData.salesDoc || fData.noticeDoc || fData.noticeNumber
          ) {
            setFormData((prev) => ({ ...prev, ...fData }));
          }
        }
        if (params.step) {
          const parsedStep = parseInt(params.step, 10);
          if (!isNaN(parsedStep) && (parsedStep === 0 || parsedStep === 1)) {
            setCurrentStep(parsedStep);
            if (parsedStep === 1) setHasEnteredReview(true);
          }
        } else if (saved && typeof saved.step === "number" && (saved.step === 0 || saved.step === 1)) {
          setCurrentStep(saved.step);
          if (saved.step === 1) setHasEnteredReview(true);
        }
        setHasCheckedDraft(true);
      };
      checkDraft();
    }
  }, [hasCheckedDraft, params.step]);

  // Universal Draft Guard Integration
  const isDirty = useCallback((): boolean => {
    if (isSubmittedSuccess) return false;
    return Boolean(
      formData.gstin || formData.financialYear || formData.requestType ||
      formData.purchaseDoc || formData.salesDoc || formData.noticeDoc || formData.noticeNumber
    );
  }, [formData, isSubmittedSuccess]);

  const saveCurrentDraft = useCallback(async () => {
    const mobile = getCleanMobile();
    await saveComplianceDraft(mobile, currentStep, formData);
  }, [formData, currentStep]);

  const clearCurrentDraft = useCallback(async () => {
    const mobile = getCleanMobile();
    await clearComplianceDraft(mobile);
    setFormData(initialFormData);
    setErrors({});
    setCurrentStep(0);
    setIsEditMode(false);
  }, []);

  const draftGuard = useUniversalDraftGuard({
    isDirty,
    onSaveDraft: saveCurrentDraft,
    onDiscardDraft: clearCurrentDraft,
    isSubmitted: () => isSubmittedSuccess,
  });

  const modifiedDocsRef = useRef<Set<string>>(new Set());

  const updateField = useCallback(
    <K extends keyof ComplianceFormData>(field: K, value: ComplianceFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (field === "purchaseDoc" || field === "salesDoc" || field === "noticeDoc") {
        modifiedDocsRef.current.add(field);
      }
    },
    []
  );

  const clearError = useCallback((field: keyof ValidationErrors) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  }, []);

  const setFieldError = useCallback(
    (field: keyof ValidationErrors, message: string) => {
      setErrors((prev) => ({ ...prev, [field]: message }));
    },
    []
  );

  // Instant GSTIN sanitization and live validation
  const handleGstinChange = useCallback(
    (text: string) => {
      const cleaned = cleanGstinInput(text);
      updateField("gstin", cleaned);
      const err = validateGstinLive(cleaned);
      if (err) {
        setErrors((prev) => ({ ...prev, gstin: err }));
      } else {
        clearError("gstin");
      }
    },
    [updateField, clearError]
  );

  // Edit action triggered from Review Step
  const handleEditStep = useCallback((section?: string) => {
    setIsEditMode(true);
    setHasEnteredReview(true);
    setEditSection(section || null);
    modifiedDocsRef.current.clear();
    setCurrentStep(0);
  }, []);

  // Safe navigation back to Review step from Edit Mode
  const handleReturnToReview = useCallback(() => {
    if (isSaving || isSubmitting) return;
    setIsEditMode(false);
    setHasEnteredReview(true);
    setEditSection(null);
    setCurrentStep(1);
  }, [isSaving, isSubmitting]);


  const confirmSubmitRef = useRef<() => Promise<void>>(async () => {});

  // Execute backend submission
  const handleConfirmSubmit = useCallback(async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);

    try {
      const success = await executeComplianceSubmission({
        formData,
        complianceId,
        router,
        cleanMobile: getCleanMobile(),
        getDraftKey: getComplianceDraftKey,
        markSubmitted: () => {
          setIsSubmittedSuccess(true);
          setHasEnteredReview(false);
          draftGuard.markSubmitted();
        },
        onRetry: () => {
          void confirmSubmitRef.current?.();
        },
      });
      if (success) {
        // Form submitted and routed
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, complianceId, router, draftGuard]);

  useEffect(() => {
    confirmSubmitRef.current = handleConfirmSubmit;
  }, [handleConfirmSubmit]);

  const handleContinue = useCallback(async () => {
    Keyboard.dismiss();

    if (currentStep === 0) {
      const normalizedData: ComplianceFormData = {
        ...formData,
        gstin: finalizeTrim(formData.gstin),
        gstr2bRef: finalizeTrim(formData.gstr2bRef),
        reconciliationRemarks: finalizeTrim(formData.reconciliationRemarks),
        noticeNumber: finalizeTrim(formData.noticeNumber),
        noticeRemarks: finalizeTrim(formData.noticeRemarks),
      };
      setFormData(normalizedData);
      const { isValid, errors: validationErrors } = validateComplianceForm(normalizedData);
      const activeErrors = { ...errors, ...validationErrors };
      const hasErrors = !isValid || Object.keys(activeErrors).length > 0;
      if (hasErrors) {
        Keyboard.dismiss();
        setErrors(activeErrors);
        const errorList = Object.values(activeErrors).filter(Boolean);
        const firstField = FIELD_ORDER.find((f) => Boolean(activeErrors[f]));
        if (firstField && options?.onValidationError) {
          options.onValidationError(firstField);
        }
        Alert.alert(
          "Required Fields Missing",
          errorList.length > 0
            ? errorList.map((err) => `• ${err}`).join("\n")
            : "Please fill in all required fields highlighted in red."
        );
        return;
      }

      if (isSaving) return;

      setIsSaving(true);
      try {
        let activeId = complianceId;

        if (activeId) {
          // 1. PUT update to existing database record; only upload newly picked/modified docs
          const changedDocs = Array.from(modifiedDocsRef.current);
          logger.debug("[Compliance Review] Updating record in DB", { gstin: formData.gstin, activeId, changedDocs });
          try {
            await gstComplianceApi.updateCompliance(formData.gstin, activeId, formData, changedDocs);
            modifiedDocsRef.current.clear();
          } catch (updateErr: any) {
            const isNotFound =
              updateErr?.response?.status === 404 ||
              updateErr?.status === 404 ||
              (typeof updateErr?.message === "string" && updateErr.message.includes("404")) ||
              (typeof updateErr?.message === "string" && updateErr.message.toLowerCase().includes("not found"));

            if (isNotFound) {
              logger.warn("[Compliance Review] Stale compliance ID not found (404). Auto-recovering by creating fresh record", { activeId });
              const res: any = await gstComplianceApi.createCompliance(formData);
              const parsedId = parseCreatedComplianceId(res);
              if (parsedId) {
                activeId = parsedId;
                setComplianceId(parsedId);
              }
            } else {
              throw updateErr;
            }
          }
        } else {
          // POST fresh record directly into DB table
          logger.debug("[Compliance Review] Creating fresh record in DB", { gstin: formData.gstin });
          const res: any = await gstComplianceApi.createCompliance(formData);
          const parsedId = parseCreatedComplianceId(res);

          if (parsedId) {
            activeId = parsedId;
            setComplianceId(parsedId);
          }
        }

        // Advance to Review immediately now that the save succeeded and active ID is resolved.
        if (isEditMode) {
          setIsEditMode(false);
          setEditSection(null);
          setDbReviewData((prev: any) => ({
            ...prev,
            gstin: formData.gstin,
            financialYear: formData.financialYear,
            requestType: formData.requestType === "Reconciliation Support" ? "RECONCILIATION_SUPPORT" : "NOTICE_RESPONSE",
            gstr2bNumber: formData.gstr2bRef,
            noticeNumber: formData.noticeNumber,
            noticeIssueDate: formData.noticeIssueDate,
            replyDueDate: formData.replyDueDate,
            message: formData.requestType === "Reconciliation Support" ? formData.reconciliationRemarks : formData.noticeRemarks,
          }));
        }
        setHasEnteredReview(true);
        setCurrentStep(1);

        // 2. Non-blocking background sync for review DTO if activeId exists.
        // Step 1 review screen renders completely from `formData` and `complianceId`.
        // A background fetch failure does NOT block the user or report a save error.
        if (activeId) {
          const targetId = activeId;
          activeSaveIdRef.current = targetId;
          void gstComplianceApi.getCompliance(formData.gstin, targetId)
            .then((fetchedDto) => {
              if (activeSaveIdRef.current === targetId && isMountedRef.current) {
                logger.debug("[Compliance Review] Background DTO retrieved", { hasDto: !!fetchedDto });
                setDbReviewData(fetchedDto);
              }
            })
            .catch((fetchErr) => {
              logger.debug("[Compliance Review] Non-blocking background fetch skipped", { error: fetchErr });
            });
        }
      } catch (err) {
        logger.error("[useComplianceForm] Error saving compliance record", { error: err });
        Alert.alert("Save Failed", sanitizeComplianceSaveError(err));
      } finally {
        setIsSaving(false);
      }
    } else {
      void handleConfirmSubmit();
    }
  }, [currentStep, isEditMode, formData, complianceId, errors, isSaving, options, handleConfirmSubmit, handleReturnToReview]);

  const handleBack = useCallback(() => {
    if (isEditMode && currentStep === 0) {
      handleReturnToReview();
    } else if (currentStep === 1) {
      setCurrentStep(0);
    } else {
      router.back();
    }
  }, [isEditMode, currentStep, handleReturnToReview, router]);

  const getButtonText = useCallback((): string => {
    if (isEditMode && currentStep === 0) {
      return "Update & Review";
    }
    if (currentStep === 0) {
      return "Continue to Review";
    }
    return "Submit";
  }, [currentStep, isEditMode]);

  const resetNavigationState = useCallback(() => {
    setHasEnteredReview(false);
    setIsEditMode(false);
    setEditSection(null);
    setCurrentStep(0);
  }, []);

  return {
    currentStep, setCurrentStep, isEditMode, editSection, setEditSection,
    hasEnteredReview, setHasEnteredReview, resetNavigationState,
    formData, errors, isSubmitting, isSaving, complianceId, dbReviewData,
    showConfirmModal, setShowConfirmModal, draftGuard, updateField, clearError,
    setFieldError, handleGstinChange, handleEditStep, handleContinue,
    handleBack, handleReturnToReview, handleConfirmSubmit, getButtonText,
  };
}

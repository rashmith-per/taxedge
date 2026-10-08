import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ComplianceFormData,
  ValidationErrors,
  validateComplianceForm,
} from "@/modules/gst/validation/complianceSchema";
import {
  cleanGstinInput,
  isValidGstin,
} from "@/modules/gst/utils/gstValidation";
import {
  submitComplianceRequest,
  SubmissionResult,
} from "@/modules/gst/services/gstComplianceService";
import { gstComplianceApi } from "@/modules/gst/services/gstComplianceApi";
import { useAuthStore } from "@/store/authStore";
import { addDraftToIndex, removeDraftFromIndex } from "@/shared/hooks/useServiceDraft";
import { useUniversalDraftGuard } from "@/shared/hooks/useUniversalDraftGuard";
import { parseCreatedComplianceId } from "../utils/complianceResponse";
import { getErrorMessage } from "@/core/error-handling/errorMessage";
import { logger } from "@/core/logging/logger";

const initialFormData: ComplianceFormData = {
  gstin: "",
  financialYear: "",
  requestType: "",
  purchaseDoc: null,
  salesDoc: null,
  gstr2bRef: "",
  reconciliationRemarks: "",
  noticeNumber: "",
  noticeIssueDate: "",
  replyDueDate: "",
  noticeDoc: null,
  noticeRemarks: "",
};

function getDraftKey(mobile: string): string {
  return `@taxedge_draft_${mobile}_gst-compliance`;
}

function getCleanMobile(): string {
  const authState = useAuthStore.getState();
  const mobile =
    authState.customer?.mobile ||
    authState.authenticatedUser?.mobileNumber ||
    authState.mobileNumber;
  return mobile ? String(mobile).replace(/\D/g, "") : "";
}

export function useComplianceForm() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<number>(0); // 0 = Form, 1 = Review
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [formData, setFormData] = useState<ComplianceFormData>(initialFormData);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [complianceId, setComplianceId] = useState<string | null>(null);
  const [dbReviewData, setDbReviewData] = useState<any>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [hasCheckedDraft, setHasCheckedDraft] = useState<boolean>(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState<boolean>(false);

  // Check if draft exists on mount and silently restore without popup
  useEffect(() => {
    if (!hasCheckedDraft) {
      const checkDraft = async () => {
        try {
          const mobile = getCleanMobile();
          if (!mobile) return;
          const raw = await AsyncStorage.getItem(getDraftKey(mobile));
          if (raw) {
            const draft = JSON.parse(raw);
            const saved: ComplianceFormData = draft.formData || {};
            if (
              saved.gstin ||
              saved.financialYear ||
              saved.requestType ||
              saved.purchaseDoc ||
              saved.noticeDoc ||
              saved.noticeNumber
            ) {
              setFormData((prev) => ({ ...prev, ...saved }));
            }
          }
        } catch (err) {
          logger.debug("[useComplianceForm] Draft read fallback", { error: err });
        }
        setHasCheckedDraft(true);
      };
      checkDraft();
    }
  }, [hasCheckedDraft]);

  // Universal Draft Guard Integration
  const isDirty = useCallback((): boolean => {
    if (isSubmittedSuccess) return false;
    return Boolean(
      formData.gstin ||
      formData.financialYear ||
      formData.requestType ||
      formData.purchaseDoc ||
      formData.salesDoc ||
      formData.noticeDoc ||
      formData.noticeNumber
    );
  }, [formData, isSubmittedSuccess]);

  const saveCurrentDraft = useCallback(async () => {
    const mobile = getCleanMobile();
    if (mobile) {
      addDraftToIndex(mobile, "gst-compliance");
      await AsyncStorage.setItem(
        getDraftKey(mobile),
        JSON.stringify({
          serviceKey: "gst-compliance",
          serviceName: "GST Compliance",
          category: "GST",
          step: currentStep,
          formData,
          updatedAt: new Date().toISOString().split("T")[0],
        })
      );
    }
  }, [formData, currentStep]);

  const clearCurrentDraft = useCallback(async () => {
    const mobile = getCleanMobile();
    if (mobile) {
      removeDraftFromIndex(mobile, "gst-compliance");
      await AsyncStorage.removeItem(getDraftKey(mobile));
    }
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

  const updateField = useCallback(
    <K extends keyof ComplianceFormData>(field: K, value: ComplianceFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
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

  // Instant GSTIN sanitization and validation
  const handleGstinChange = useCallback(
    (text: string) => {
      const cleaned = cleanGstinInput(text);
      updateField("gstin", cleaned);

      if (cleaned.length === 15) {
        if (!isValidGstin(cleaned)) {
          setErrors((prev) => ({
            ...prev,
            gstin: "Invalid GSTIN format (e.g. 29AAAAA0000A1Z5)",
          }));
        } else {
          clearError("gstin");
        }
      } else {
        clearError("gstin");
      }
    },
    [updateField, clearError]
  );

  // Edit action triggered from Review Step
  const handleEditStep = useCallback((_section?: string) => {
    setIsEditMode(true);
    setCurrentStep(0);
  }, []);

  // Continue or Save & Review action: Saves to DB (POST or PUT) and fetches back from DB
  const handleContinue = useCallback(async () => {
    if (currentStep === 0) {
      const { isValid, errors: validationErrors } = validateComplianceForm(formData);
      if (!isValid) {
        setErrors(validationErrors);
        const errorList = Object.values(validationErrors).filter(Boolean);
        Alert.alert(
          "Required Fields Missing",
          errorList.length > 0
            ? errorList.map((err) => `• ${err}`).join("\n")
            : "Please fill in all required fields highlighted in red."
        );
        return;
      }

      setIsSaving(true);
      try {
        let activeId = complianceId;

        if (activeId) {
          // 1. PUT update to existing database record
          logger.debug("[Compliance Review] Updating record in DB", { gstin: formData.gstin, activeId });
          await gstComplianceApi.updateCompliance(formData.gstin, activeId, formData);
        } else {
          // 1. POST create new record in database
          logger.debug("[Compliance Review] Saving new compliance record in DB");
          const res: any = await gstComplianceApi.createCompliance(formData);
          logger.debug("[Compliance Review] Create response received", { success: !!res });

          const parsedId = parseCreatedComplianceId(res);

          if (parsedId) {
            activeId = parsedId;
            setComplianceId(parsedId);
          }
        }

        // 2. GET retrieve record from DB by ID to populate Review section
        if (activeId) {
          logger.debug("[Compliance Review] Fetching record from DB", { gstin: formData.gstin, activeId });
          const fetchedDto = await gstComplianceApi.getCompliance(formData.gstin, activeId);
          logger.debug("[Compliance Review] Retrieved from DB", { hasDto: !!fetchedDto });
          setDbReviewData(fetchedDto);
        }

        if (isEditMode) {
          setIsEditMode(false);
        }

        setCurrentStep(1);
      } catch (err) {
        logger.error("[useComplianceForm] Error saving/fetching compliance record", { error: err });
        Alert.alert(
          "Save Failed",
          getErrorMessage(err) || "Failed to save details to database. Please check your inputs and try again."
        );
      } finally {
        setIsSaving(false);
      }
    } else {
      setShowConfirmModal(true);
    }
  }, [currentStep, isEditMode, formData, complianceId]);

  const handleBack = useCallback(() => {
    if (currentStep === 1) {
      setCurrentStep(0);
    } else {
      router.back();
    }
  }, [currentStep, router]);

  // Execute backend submission
  const handleConfirmSubmit = useCallback(async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);

    try {
      const result: SubmissionResult = await submitComplianceRequest(formData, complianceId);

      if (result.success) {
        setIsSubmittedSuccess(true);
        draftGuard.markSubmitted();

        const mobile = getCleanMobile();
        if (mobile) {
          removeDraftFromIndex(mobile, "gst-compliance");
          AsyncStorage.removeItem(getDraftKey(mobile)).catch((e) => {
            logger.debug("[useComplianceForm] Failed to remove draft key", { error: e });
          });
        }

        router.replace({
          pathname: "/service/gst-compliance-success",
          params: {
            referenceId: result.referenceId,
            requestType: formData.requestType,
            gstin: formData.gstin,
            submittedAt: result.submittedAt,
            estimatedResponse: result.estimatedResponse,
          },
        });
      } else {
        Alert.alert(
          "Submission Failed",
          result.error || "Unable to submit your request. Please check your connection and retry.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Retry", onPress: handleConfirmSubmit },
          ]
        );
      }
    } catch (err) {
      logger.warn("[useComplianceForm] Network/submission failure", { error: err });
      Alert.alert(
        "Network Error",
        "Could not communicate with the server. Please verify your internet connection.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Retry", onPress: handleConfirmSubmit },
        ]
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, complianceId, router, draftGuard]);

  const getButtonText = useCallback((): string => {
    if (isEditMode && currentStep === 0) {
      return "Update & Review";
    }
    if (currentStep === 0) {
      return "Continue to Review";
    }
    return "Submit Compliance Request";
  }, [currentStep, isEditMode]);

  return {
    currentStep,
    setCurrentStep,
    isEditMode,
    formData,
    errors,
    isSubmitting,
    isSaving,
    complianceId,
    dbReviewData,
    showConfirmModal,
    setShowConfirmModal,
    draftGuard,
    updateField,
    clearError,
    handleGstinChange,
    handleEditStep,
    handleContinue,
    handleBack,
    handleConfirmSubmit,
    getButtonText,
  };
}

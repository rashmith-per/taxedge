import { useState, useRef, useEffect, useCallback, ElementRef } from "react";
import { ScrollView, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useApplicationStore } from "@/store/applicationStore";
import { useNotificationStore } from "@/store/notificationStore";
import { useAuthStore } from "@/store/authStore";
import { useUniversalDraftGuard } from "@/shared/hooks/useUniversalDraftGuard";
import { removeDraftFromIndex } from "@/shared/hooks/useServiceDraft";
import { logger } from "@/core/logging/logger";

import {
  AmendmentStep, SupportingDoc, PickerModalState, SubmissionResult, AmendmentFormData, INITIAL_AMENDMENT_FORM_DATA,
} from "../types/gstAmendmentTypes";
import { AMENDMENT_SECTIONS } from "../config/gstNonCoreAmendmentConfig";
import {
  validateGstinInput, validateFieldRealtime, isFormDataDirty,
} from "../utils/gstAmendmentValidation";
import { persistSupportingDocument } from "../utils/gstDocumentPersistence";
import { finalizeTrim, normalizeStructuredCode } from "@/modules/gst/utils/gstSpaceValidation";
import { validateGstinLive } from "@/modules/gst/utils/gstValidation";
import { resolveTargetGstId } from "../utils/gstAmendmentHelpers";
import { useGstAmendmentDetails } from "./useGstAmendmentDetails";
import { restoreAmendmentDraftFromStorage } from "./useGstAmendmentDraftRestore";
import { executeAmendmentSubmission } from "./useGstAmendmentSubmissionAction";
import { browseDocumentForSection, scanDocumentForSection } from "./useGstAmendmentDocHandlers";
import { processAmendmentReview } from "./useGstAmendmentReviewAction";

const stripImageData = (data: any): any => {
  if (!data || typeof data !== "object") return data;
  const { imageData, ...rest } = data;
  return rest;
};

export function useGstAmendmentWorkflow() {
  const router = useRouter();
  const params = useLocalSearchParams<{ gstin?: string; section?: string; step?: string; resume?: string }>();
  const scrollViewRef = useRef<ElementRef<typeof ScrollView>>(null);

  const customer = useAuthStore((state) => state.customer);
  const gstDraft = useApplicationStore((state) => state.gstDraft);
  const applications = useApplicationStore((state) => state.applications);
  const createApplication = useApplicationStore((state) => state.createApplication);
  const gstAmendmentDraft = useApplicationStore((state) => state.gstAmendmentDraft);
  const saveGstAmendmentDraft = useApplicationStore((state) => state.saveGstAmendmentDraft);
  const clearGstAmendmentDraft = useApplicationStore((state) => state.clearGstAmendmentDraft);
  const addNotification = useNotificationStore((state) => state.addNotification);

  // Workflow state
  const [currentStep, setCurrentStep] = useState<AmendmentStep>("LANDING");
  const [gstin, setGstin] = useState<string>("");
  const [selectedSectionId, setSelectedSectionId] = useState<string>("legal-name");
  const [formData, setFormData] = useState<AmendmentFormData>(INITIAL_AMENDMENT_FORM_DATA);
  const [sectionDocs, setSectionDocs] = useState<Record<string, SupportingDoc | null>>({});
  const [declared, setDeclared] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [isProofsExpanded, setIsProofsExpanded] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [amendmentId, setAmendmentId] = useState<number | string | null>(null);
  const [dbReviewData, setDbReviewData] = useState<any>(null);
  const [isSavingRecord, setIsSavingRecord] = useState(false);
  const savedDraftStepRef = useRef<AmendmentStep | null>(null);
  const savedDraftSectionIdRef = useRef<string | null>(null);

  const [pickerModal, setPickerModal] = useState<PickerModalState>({
    isOpen: false,
    title: "",
    options: [],
    selectedVal: "",
    onSelect: () => {},
  });

  const targetGstId = resolveTargetGstId(gstin, customer, gstDraft, applications);
  const registeredDetails = useGstAmendmentDetails(targetGstId, selectedSectionId);

  // Initial Draft Restoration on mount
  const hasRestoredDraftRef = useRef(false);
  useEffect(() => {
    if (hasRestoredDraftRef.current) return;
    hasRestoredDraftRef.current = true;

    const restoreDraft = async () => {
      try {
        const res = await restoreAmendmentDraftFromStorage({
          customerMobile: customer?.mobile,
          gstAmendmentDraft,
          paramsGstin: params.gstin,
          paramsSection: params.section,
          paramsStep: params.step,
          paramsResume: params.resume,
        });

        savedDraftStepRef.current = res.savedStep;
        savedDraftSectionIdRef.current = res.savedSectionId;

        if (res.restoredGstin) setGstin(res.restoredGstin);
        if (res.restoredSectionId) setSelectedSectionId(res.restoredSectionId);
        if (res.restoredFormData && Object.keys(res.restoredFormData).length > 0) {
          setFormData((prev) => ({ ...prev, ...res.restoredFormData }));
        }
        if (res.restoredSectionDocs && Object.keys(res.restoredSectionDocs).length > 0) {
          setSectionDocs(res.restoredSectionDocs);
        }
        if (res.restoredAmendmentId) setAmendmentId(res.restoredAmendmentId);
        if (res.restoredDbReviewData) setDbReviewData(res.restoredDbReviewData);

        setCurrentStep(res.initialStep);
      } catch (err) {
        logger.warn("[useGstAmendmentWorkflow] Error restoring draft:", { error: err });
      }
    };

    restoreDraft();
  }, [customer?.mobile, gstAmendmentDraft, params.gstin, params.resume, params.section, params.step]);


  const selectedSection =
    AMENDMENT_SECTIONS.find((s) => s.id === selectedSectionId) || AMENDMENT_SECTIONS[0];

  const supportingDoc = sectionDocs[selectedSectionId] || null;

  // Universal Draft Guard Integration with section-scoped docs
  const draftGuard = useUniversalDraftGuard({
    isDirty: () => isFormDataDirty(currentStep, formData, sectionDocs),
    onSaveDraft: () => {
      savedDraftStepRef.current = currentStep;
      savedDraftSectionIdRef.current = selectedSectionId;
      saveGstAmendmentDraft({
        formData: { gstin, selectedSectionId, ...formData, _sectionDocs: sectionDocs, amendmentId, dbReviewData: stripImageData(dbReviewData) },
        step: currentStep,
        updatedAt: new Date().toISOString().split("T")[0],
      });
    },
    onDiscardDraft: () => {
      savedDraftStepRef.current = null;
      savedDraftSectionIdRef.current = null;
      clearGstAmendmentDraft();
      setFormData(INITIAL_AMENDMENT_FORM_DATA);
      setSectionDocs({});
      setCurrentStep("LANDING");
    },
    isSubmitted: () => currentStep === "SUCCESS",
  });

  const clearError = useCallback((key: string) => {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const validateFieldOnBlur = useCallback((field: keyof AmendmentFormData) => {
    setFormData((currentData) => {
      const err = validateFieldRealtime(field, currentData[field], currentData);
      setErrors((prev) => (err ? { ...prev, [field]: err } : prev[field] ? Object.fromEntries(Object.entries(prev).filter(([k]) => k !== field)) : prev));
      return currentData;
    });
  }, []);

  const updateFormField = useCallback((field: keyof AmendmentFormData, value: string) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      const fieldError = validateFieldRealtime(field, value, next);
      setErrors((prevErr) => {
        const copy = { ...prevErr };
        if (fieldError) copy[field] = fieldError;
        else delete copy[field];

        // Cross-field revalidation: if bank account changed and confirm has value, revalidate confirm
        if (field === "newBankAccountNumber" && next.confirmBankAccountNumber) {
          const confirmErr = validateFieldRealtime("confirmBankAccountNumber", next.confirmBankAccountNumber, next);
          if (confirmErr) copy.confirmBankAccountNumber = confirmErr;
          else delete copy.confirmBankAccountNumber;
        }
        return copy;
      });
      return next;
    });
  }, []);

  const handleGstinChange = useCallback((text: string) => {
    const cleaned = normalizeStructuredCode(text);
    setGstin(cleaned);
    setFormData(INITIAL_AMENDMENT_FORM_DATA);
    setSectionDocs({});
    setAmendmentId(null);
    setDbReviewData(null);
    savedDraftStepRef.current = null;
    savedDraftSectionIdRef.current = null;

    // Live validation feedback
    if (!cleaned) {
      clearError("gstin");
    } else {
      const err = validateGstinLive(cleaned);
      if (err) {
        setErrors((prev) => ({ ...prev, gstin: err }));
      } else {
        clearError("gstin");
      }
    }
  }, [clearError]);

  const handleUploadSuccess = useCallback(async (doc: SupportingDoc) => {
    const persisted = await persistSupportingDocument(doc);
    setSectionDocs((prev) => ({
      ...prev,
      [selectedSectionId]: persisted,
    }));
    clearError("supportingDoc");
  }, [clearError, selectedSectionId]);

  const handleExplicitSaveDraft = useCallback(async () => {
    savedDraftStepRef.current = currentStep;
    savedDraftSectionIdRef.current = selectedSectionId;
    saveGstAmendmentDraft({
      formData: { gstin, selectedSectionId, ...formData, _sectionDocs: sectionDocs, amendmentId, dbReviewData: stripImageData(dbReviewData) },
      step: currentStep,
      updatedAt: new Date().toISOString().split("T")[0],
    });
    Alert.alert("Draft Saved", "Your GST amendment progress has been saved. You can resume anytime from Incomplete Applications on Home.", [{ text: "OK", onPress: () => router.replace("/(main)/home") }]);
  }, [amendmentId, currentStep, dbReviewData, formData, gstin, router, saveGstAmendmentDraft, sectionDocs, selectedSectionId]);

  const handleBrowseFiles = useCallback(async () => {
    await browseDocumentForSection(selectedSectionId, setSectionDocs, clearError);
  }, [clearError, selectedSectionId]);

  const handleScanFile = useCallback(async () => {
    await scanDocumentForSection(selectedSectionId, setSectionDocs, clearError);
  }, [clearError, selectedSectionId]);

  const handleDeleteDoc = useCallback(() => {
    setSectionDocs((prev) => ({
      ...prev,
      [selectedSectionId]: null,
    }));
  }, [selectedSectionId]);

  const handleSelectSection = useCallback((sectionId: string) => {
    const validation = validateGstinInput(gstin);
    if (!validation.isValid) {
      setErrors({ gstin: validation.error });
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    clearError("gstin");
    setSelectedSectionId(sectionId);
    setIsProofsExpanded(false);
    setErrors({});
    const hasSavedReview =
      savedDraftStepRef.current === "REVIEW" &&
      savedDraftSectionIdRef.current === sectionId;
    if (hasSavedReview) {
      setCurrentStep("REVIEW");
    } else {
      setCurrentStep("EDIT");
    }
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, [clearError, gstin]);

  const openPickerModal = useCallback((
    title: string,
    options: string[],
    selectedVal: string,
    onSelect: (val: string) => void
  ) => {
    setPickerModal({ isOpen: true, title, options, selectedVal, onSelect });
  }, []);

  const closePickerModal = useCallback(() => {
    setPickerModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleReviewChanges = useCallback(async () => {
    // Normalize and trim text fields across formData before validation & review
    const normalizedFormData: AmendmentFormData = Object.fromEntries(
      Object.entries(formData).map(([k, v]) => [k, typeof v === "string" ? finalizeTrim(v) : v])
    ) as unknown as AmendmentFormData;
    setFormData(normalizedFormData);

    setIsSavingRecord(true);
    try {
      const res = await processAmendmentReview({
        selectedSectionId,
        formData: normalizedFormData,
        supportingDoc,
        isEditMode,
        amendmentId,
        targetGstId,
        setAmendmentId,
        setDbReviewData,
      });

      if (!res.success) {
        if (res.validationErrors) setErrors(res.validationErrors);
        return;
      }

      setErrors({});
      if (isEditMode) {
        setIsEditMode(false);
      }
      savedDraftStepRef.current = "REVIEW";
      savedDraftSectionIdRef.current = selectedSectionId;
      saveGstAmendmentDraft({
        formData: { gstin, selectedSectionId, ...normalizedFormData, _sectionDocs: sectionDocs, amendmentId, dbReviewData: stripImageData(dbReviewData) },
        step: "REVIEW",
        updatedAt: new Date().toISOString().split("T")[0],
      });
      setCurrentStep("REVIEW");
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } catch {
      // Alerted in processAmendmentReview
    } finally {
      setIsSavingRecord(false);
    }
  }, [amendmentId, dbReviewData, formData, gstin, isEditMode, saveGstAmendmentDraft, sectionDocs, selectedSectionId, supportingDoc, targetGstId]);

  const handleEditFromReview = useCallback(() => {
    setIsEditMode(true);
    setErrors({});
    setCurrentStep("EDIT");
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  const handleBackFromEdit = useCallback(() => {
    if (isEditMode) {
      setIsEditMode(false);
      setCurrentStep("REVIEW");
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else if (isFormDataDirty(currentStep, formData, sectionDocs)) {
      draftGuard.openDraftModal();
    } else {
      setCurrentStep("LANDING");
    }
  }, [currentStep, draftGuard, formData, isEditMode, sectionDocs]);

  const handleSubmitAmendment = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const result = await executeAmendmentSubmission({
        declared,
        supportingDoc,
        selectedSectionId,
        targetGstId,
        formData,
        selectedSection,
        registeredDetails,
        createApplication,
        addNotification,
        markSubmitted: draftGuard.markSubmitted,
        amendmentId,
        clearGstAmendmentDraft,
        customerMobile: customer?.mobile,
      });

      if (result) {
        savedDraftStepRef.current = null;
        savedDraftSectionIdRef.current = null;
        setSubmissionResult(result);
        setCurrentStep("SUCCESS");
      }
    } catch {
      // Error is caught & alerted in executeAmendmentSubmission
    } finally {
      setIsSubmitting(false);
    }
  }, [addNotification, amendmentId, clearGstAmendmentDraft, createApplication, customer?.mobile, declared, draftGuard.markSubmitted, formData, isSubmitting, registeredDetails, selectedSection, selectedSectionId, supportingDoc, targetGstId]);

  return {
    router, scrollViewRef, currentStep, setCurrentStep, gstin, selectedSection,
    selectedSectionId, formData, supportingDoc, sectionDocs, setSectionDocs,
    handleDeleteDoc, declared, setDeclared, errors, isSubmitting, submissionResult,
    isProofsExpanded, setIsProofsExpanded, isEditMode, amendmentId, dbReviewData,
    isSavingRecord, pickerModal, registeredDetails, draftGuard, updateFormField,
    clearError, handleGstinChange, handleUploadSuccess, handleExplicitSaveDraft,
    handleBrowseFiles, handleScanFile, handleSelectSection, openPickerModal,
    closePickerModal, handleReviewChanges, handleEditFromReview, handleBackFromEdit,
    handleSubmitAmendment, validateFieldOnBlur,
  };
}

import { useState, useRef, useEffect, useCallback } from "react";
import { ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";

import { useApplicationStore } from "@/store/applicationStore";
import { useNotificationStore } from "@/store/notificationStore";
import { useAuthStore } from "@/store/authStore";
import { pickImageFromGallery, pickImageFromCamera } from "@/modules/gst/utils/imageUploadHelper";
import { useUniversalDraftGuard } from "@/shared/hooks/useUniversalDraftGuard";
import { logger } from "@/core/logging/logger";

import {
  AmendmentStep,
  SupportingDoc,
  PickerModalState,
  SubmissionResult,
  AmendmentFormData,
  INITIAL_AMENDMENT_FORM_DATA,
} from "../types/gstAmendmentTypes";
import { AMENDMENT_SECTIONS } from "../config/gstNonCoreAmendmentConfig";
import {
  validateGstinInput,
  validateSectionForm,
  isFormDataDirty,
} from "../utils/gstAmendmentValidation";
import { resolveTargetGstId } from "../utils/gstAmendmentHelpers";
import { useGstAmendmentDetails } from "./useGstAmendmentDetails";
import { submitAmendmentService } from "../services/submitAmendmentService";
import { persistAmendmentForReview } from "../services/persistAmendmentForReview";
import { getErrorMessage } from "@/core/error-handling/errorMessage";

export function useGstAmendmentWorkflow() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  const customer = useAuthStore((state) => state.customer);
  const gstDraft = useApplicationStore((state) => state.gstDraft);
  const applications = useApplicationStore((state) => state.applications);
  const createApplication = useApplicationStore((state) => state.createApplication);
  const saveGstAmendmentDraft = useApplicationStore((state) => state.saveGstAmendmentDraft);
  const clearGstAmendmentDraft = useApplicationStore((state) => state.clearGstAmendmentDraft);
  const addNotification = useNotificationStore((state) => state.addNotification);

  // Workflow state
  const [currentStep, setCurrentStep] = useState<AmendmentStep>("LANDING");
  const [gstin, setGstin] = useState<string>("");
  const [selectedSectionId, setSelectedSectionId] = useState<string>("legal-name");
  const [formData, setFormData] = useState<AmendmentFormData>(INITIAL_AMENDMENT_FORM_DATA);

  const [supportingDoc, setSupportingDoc] = useState<SupportingDoc | null>(null);
  const [declared, setDeclared] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [isProofsExpanded, setIsProofsExpanded] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // ID and DB state for amendment record
  const [amendmentId, setAmendmentId] = useState<number | null>(null);
  const [dbReviewData, setDbReviewData] = useState<any>(null);
  const [isSavingRecord, setIsSavingRecord] = useState(false);

  const [pickerModal, setPickerModal] = useState<PickerModalState>({
    isOpen: false,
    title: "",
    options: [],
    selectedVal: "",
    onSelect: () => {},
  });

  const targetGstId = resolveTargetGstId(gstin, customer, gstDraft, applications);
  const registeredDetails = useGstAmendmentDetails(targetGstId, selectedSectionId);

  useEffect(() => {
    setIsProofsExpanded(false);
  }, [selectedSectionId, currentStep]);

  const selectedSection =
    AMENDMENT_SECTIONS.find((s) => s.id === selectedSectionId) || AMENDMENT_SECTIONS[0];

  // Universal Draft Guard Integration
  const draftGuard = useUniversalDraftGuard({
    isDirty: () => isFormDataDirty(currentStep, formData, supportingDoc),
    onSaveDraft: () => {
      saveGstAmendmentDraft({
        formData: { gstin, selectedSectionId, ...formData },
        step: currentStep,
        updatedAt: new Date().toISOString().split("T")[0],
      });
    },
    onDiscardDraft: () => {
      clearGstAmendmentDraft();
    },
    isSubmitted: () => currentStep === "SUCCESS",
  });

  const clearError = useCallback((key: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const updateFormField = useCallback((field: keyof AmendmentFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleGstinChange = useCallback((text: string) => {
    const cleaned = text.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    setGstin(cleaned);
    clearError("gstin");
  }, [clearError]);

  const handleBrowseFiles = useCallback(async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/jpeg", "image/png", "image/jpg"],
        copyToCacheDirectory: true,
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        const file = res.assets[0];
        const sizeMb = file.size ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : "0.1 MB";
        setSupportingDoc({ uri: file.uri, name: file.name, size: sizeMb });
        clearError("supportingDoc");
      }
    } catch {
      const uri = await pickImageFromGallery(false);
      if (uri) {
        setSupportingDoc({
          uri,
          name: `Document_${Date.now().toString().slice(-4)}.pdf`,
          size: "0.2 MB",
        });
        clearError("supportingDoc");
      }
    }
  }, [clearError]);

  const handleScanFile = useCallback(async () => {
    const uri = await pickImageFromCamera(false);
    if (uri) {
      setSupportingDoc({
        uri,
        name: `Scan_${Date.now().toString().slice(-4)}.jpg`,
        size: "1.4 MB",
      });
      clearError("supportingDoc");
    }
  }, [clearError]);

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
    setCurrentStep("EDIT");
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
    const { isValid, errors: validationErrs } = validateSectionForm(
      selectedSectionId,
      formData,
      supportingDoc
    );

    if (!isValid) {
      setErrors(validationErrs);
      Alert.alert(
        "Required Information",
        "Please fill in the required amendment details and attach supporting proof."
      );
      return;
    }

    setErrors({});
    setIsSavingRecord(true);

    try {
      await persistAmendmentForReview(
        {
          isEditMode,
          amendmentId,
          sectionId: selectedSectionId,
          targetGstId,
          formData,
          supportingDoc,
        },
        { onSaved: setAmendmentId, onReviewData: setDbReviewData }
      );
      if (isEditMode) {
        setIsEditMode(false);
      }
      setCurrentStep("REVIEW");
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } catch (err) {
      logger.error("[useGstAmendmentWorkflow] Error saving/updating amendment record:", { error: err });
      Alert.alert(
        "Save Failed",
        getErrorMessage(err) || "Failed to save amendment record. Please try again."
      );
    } finally {
      setIsSavingRecord(false);
    }
  }, [amendmentId, formData, isEditMode, selectedSectionId, supportingDoc, targetGstId]);

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
    } else {
      setCurrentStep("LANDING");
    }
  }, [isEditMode]);

  const handleSubmitAmendment = useCallback(async () => {
    if (!declared) {
      Alert.alert(
        "Declaration Required",
        "Please tick the declaration checkbox to authorise TaxEdge to file your amendment."
      );
      return;
    }

    if (!supportingDoc) {
      Alert.alert(
        "Supporting Proof Required",
        "Please attach a supporting proof document before submitting your amendment."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitAmendmentService({
        selectedSectionId,
        targetGstId,
        formData,
        supportingDoc,
        selectedSection,
        registeredDetails,
        createApplication,
        addNotification,
        markSubmitted: draftGuard.markSubmitted,
        amendmentId,
      });

      setSubmissionResult(result);
      setCurrentStep("SUCCESS");
    } catch (error) {
      logger.error("[useGstAmendmentWorkflow] Amendment Submission Error:", { error });
      Alert.alert(
        "Submission Failed",
        getErrorMessage(error) || "Failed to submit amendment. Please check your network connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [addNotification, amendmentId, createApplication, declared, draftGuard.markSubmitted, formData, registeredDetails, selectedSection, selectedSectionId, supportingDoc, targetGstId]);

  return {
    router,
    scrollViewRef,
    currentStep,
    setCurrentStep,
    gstin,
    selectedSection,
    selectedSectionId,
    formData,
    supportingDoc,
    setSupportingDoc,
    declared,
    setDeclared,
    errors,
    isSubmitting,
    submissionResult,
    isProofsExpanded,
    setIsProofsExpanded,
    isEditMode,
    amendmentId,
    dbReviewData,
    isSavingRecord,
    pickerModal,
    registeredDetails,
    draftGuard,
    updateFormField,
    clearError,
    handleGstinChange,
    handleBrowseFiles,
    handleScanFile,
    handleSelectSection,
    openPickerModal,
    closePickerModal,
    handleReviewChanges,
    handleEditFromReview,
    handleBackFromEdit,
    handleSubmitAmendment,
  };
}

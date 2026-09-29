import React, { useState, useRef, useEffect } from "react";
import { ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as DocumentPicker from "expo-document-picker";

import { useApplicationStore } from "@/store/applicationStore";
import { useNotificationStore } from "@/store/notificationStore";
import { useAuthStore } from "@/store/authStore";
import { pickImageFromGallery, pickImageFromCamera } from "@/modules/gst/utils/imageUploadHelper";
import { UniversalDraftModal } from "@/shared/components/UniversalDraftModal";
import { useUniversalDraftGuard } from "@/shared/hooks/useUniversalDraftGuard";

import {
  AmendmentStep,
  SupportingDoc,
  PickerModalState,
  SubmissionResult,
  AmendmentFormData,
  INITIAL_AMENDMENT_FORM_DATA,
} from "../../types/gstAmendmentTypes";
import { AMENDMENT_SECTIONS } from "../../config/gstNonCoreAmendmentConfig";
import {
  validateGstinInput,
  validateSectionForm,
  isFormDataDirty,
} from "../../utils/gstAmendmentValidation";
import { resolveTargetGstId } from "../../utils/gstAmendmentHelpers";
import { useGstAmendmentDetails } from "../../hooks/useGstAmendmentDetails";
import { submitAmendmentService } from "../../services/submitAmendmentService";

import { GstAmendmentLanding } from "../../components/GstAmendmentLanding";
import { GstCoreAmendmentEdit } from "../../components/GstCoreAmendmentEdit";
import { GstNonCoreAmendmentEdit } from "../../components/GstNonCoreAmendmentEdit";
import { GstAmendmentReview } from "../../components/GstAmendmentReview";
import { GstAmendmentSuccess } from "../../components/GstAmendmentSuccess";
import { GstAmendmentPicker } from "../../components/GstAmendmentPicker";

export function GstAmendmentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
  const [gstin, setGstin] = useState<string>(
    () =>
      (customer as any)?.gstId ||
      gstDraft?.createdGstId ||
      applications.find((a) => a.formData?.createdGstId || a.formData?.gstId || a.formData?.gstin)?.formData?.createdGstId ||
      ""
  );
  const [selectedSectionId, setSelectedSectionId] = useState<string>("legal-name");
  const [formData, setFormData] = useState<AmendmentFormData>(INITIAL_AMENDMENT_FORM_DATA);

  const [supportingDoc, setSupportingDoc] = useState<SupportingDoc | null>(null);
  const [declared, setDeclared] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [isProofsExpanded, setIsProofsExpanded] = useState(false);

  const [pickerModal, setPickerModal] = useState<PickerModalState>({
    isOpen: false,
    title: "",
    options: [],
    selectedVal: "",
    onSelect: () => { },
  });

  const targetGstId = resolveTargetGstId(gstin, customer, gstDraft, applications);
  const registeredDetails = useGstAmendmentDetails(targetGstId, selectedSectionId);

  useEffect(() => {
    setIsProofsExpanded(false);
  }, [selectedSectionId, currentStep]);

  const selectedSection =
    AMENDMENT_SECTIONS.find((s) => s.id === selectedSectionId) || AMENDMENT_SECTIONS[0];

  // Universal Draft Guard Integration
  const {
    showDraftModal,
    markSubmitted,
    handleSaveAndExit,
    handleDiscardAndExit,
    handleCancel,
  } = useUniversalDraftGuard({
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

  const clearError = (key: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const updateFormField = (field: keyof AmendmentFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGstinChange = (text: string) => {
    const cleaned = text.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    setGstin(cleaned);
    clearError("gstin");
  };

  const handleBrowseFiles = async () => {
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
  };

  const handleScanFile = async () => {
    const uri = await pickImageFromCamera(false);
    if (uri) {
      setSupportingDoc({
        uri,
        name: `Scan_${Date.now().toString().slice(-4)}.jpg`,
        size: "1.4 MB",
      });
      clearError("supportingDoc");
    }
  };

  const handleSelectSection = (sectionId: string) => {
    const validation = validateGstinInput(gstin);
    if (!validation.isValid) {
      setErrors({ gstin: validation.error! });
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    clearError("gstin");
    setSelectedSectionId(sectionId);
    setIsProofsExpanded(false);
    setErrors({});
    setCurrentStep("EDIT");
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const openPickerModal = (
    title: string,
    options: string[],
    selectedVal: string,
    onSelect: (val: string) => void
  ) => {
    setPickerModal({ isOpen: true, title, options, selectedVal, onSelect });
  };

  const handleReviewChanges = () => {
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
    setCurrentStep("REVIEW");
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleSubmitAmendment = async () => {
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
        markSubmitted,
      });

      setSubmissionResult(result);
      setCurrentStep("SUCCESS");
    } catch (error: any) {
      console.error("Amendment Submission Error:", error);
      Alert.alert(
        "Submission Failed",
        error?.message || "Failed to submit amendment. Please check your network connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {currentStep === "LANDING" && (
        <GstAmendmentLanding
          gstin={gstin}
          onGstinChange={handleGstinChange}
          errorGstin={errors.gstin}
          onSelectSection={handleSelectSection}
          onBack={() => router.back()}
          scrollViewRef={scrollViewRef}
          insets={insets}
        />
      )}

      {currentStep === "EDIT" && selectedSection.type === "core" && (
        <GstCoreAmendmentEdit
          selectedSection={selectedSection}
          registeredDetails={registeredDetails}
          formData={formData}
          errors={errors}
          supportingDoc={supportingDoc}
          isProofsExpanded={isProofsExpanded}
          insets={insets}
          scrollViewRef={scrollViewRef}
          onBack={() => setCurrentStep("LANDING")}
          onUpdateField={updateFormField}
          onClearError={clearError}
          onOpenPicker={openPickerModal}
          onBrowseFiles={handleBrowseFiles}
          onScanFile={handleScanFile}
          onDeleteDoc={() => setSupportingDoc(null)}
          onToggleExpandProofs={() => setIsProofsExpanded((prev) => !prev)}
          onReviewChanges={handleReviewChanges}
        />
      )}

      {currentStep === "EDIT" && selectedSection.type === "non-core" && (
        <GstNonCoreAmendmentEdit
          selectedSection={selectedSection}
          registeredDetails={registeredDetails}
          formData={formData}
          errors={errors}
          supportingDoc={supportingDoc}
          isProofsExpanded={isProofsExpanded}
          insets={insets}
          scrollViewRef={scrollViewRef}
          onBack={() => setCurrentStep("LANDING")}
          onUpdateField={updateFormField}
          onClearError={clearError}
          onOpenPicker={openPickerModal}
          onBrowseFiles={handleBrowseFiles}
          onScanFile={handleScanFile}
          onDeleteDoc={() => setSupportingDoc(null)}
          onToggleExpandProofs={() => setIsProofsExpanded((prev) => !prev)}
          onReviewChanges={handleReviewChanges}
        />
      )}

      {currentStep === "REVIEW" && (
        <GstAmendmentReview
          gstin={gstin}
          selectedSection={selectedSection}
          formData={formData}
          supportingDoc={supportingDoc}
          declared={declared}
          onToggleDeclared={() => setDeclared((prev) => !prev)}
          isSubmitting={isSubmitting}
          insets={insets}
          scrollViewRef={scrollViewRef}
          onEdit={() => setCurrentStep("EDIT")}
          onSubmit={handleSubmitAmendment}
        />
      )}

      {currentStep === "SUCCESS" && submissionResult && (
        <GstAmendmentSuccess
          submissionResult={submissionResult}
          insets={insets}
          onTrack={() => {
            useApplicationStore.getState().setSelectedApplicationId(submissionResult.appId);
            router.push(`/application/${submissionResult.appId}`);
          }}
          onOpenApplications={() => router.push("/(main)/applications")}
        />
      )}

      <GstAmendmentPicker
        pickerModal={pickerModal}
        onClose={() => setPickerModal((prev) => ({ ...prev, isOpen: false }))}
      />

      <UniversalDraftModal
        visible={showDraftModal}
        title="Save Amendment Draft?"
        message="You have unsaved changes in your GST amendment request. Save your progress so you can resume anytime."
        saveButtonText="Save as Draft & Exit"
        discardButtonText="Discard & Exit"
        cancelButtonText="Keep Editing"
        onSaveAndExit={handleSaveAndExit}
        onDiscardAndExit={handleDiscardAndExit}
        onCancel={handleCancel}
      />
    </>
  );
}

export default GstAmendmentScreen;

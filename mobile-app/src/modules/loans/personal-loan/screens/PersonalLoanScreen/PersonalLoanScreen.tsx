import React, { useCallback, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "../../../../../shared/theme";
import { useAuthStore } from "../../../../authentication/store/authStore";
import { loansApi } from "../../../services/loansApi";
import { INDIVIDUAL_DOCUMENTS_TEMPLATE } from "../../../mock/loanServices";
import { UniversalDraftModal } from "../../../../../shared/components/UniversalDraftModal";
import { useServiceDraft } from "../../../../../shared/hooks/useServiceDraft";
import { KeyboardAwareScrollView } from "@/shared/components/KeyboardAwareFormLayout";
import { LoanStepIndicator } from "../../../components/LoanStepIndicator";
import { useLoanWizard } from "../../../hooks/useLoanWizard";
import { useLoanFormErrors } from "../../../hooks/useLoanFormErrors";
import { getBottomBarPadding, getSafeAreaTopPadding } from "../../../styles/loanScreenLayout.styles";
import {
  LoanDetailsFormData,
  LoanBankingFormData,
  LoanDocumentItem,
  LoanApplicationDraft,
} from "../../../types/loans.types";
import {
  personalLoanSchemas,
  validateForm,
} from "../../../validation/loanValidationEngine";
import { validateLoanDocuments } from "../../../validation/loansSchema";
import {
  PersonalLoanFinancialsStep,
  PersonalLoanBankingStep,
  PersonalLoanDocumentsStep,
  PersonalLoanReviewStep,
} from "../../components";
import { styles } from "./PersonalLoanScreen.styles";

const STEPS = ["Financials", "Banking", "Documents", "Review"] as const;
const PERSONAL_LOAN_DOCUMENTS_TEMPLATE = INDIVIDUAL_DOCUMENTS_TEMPLATE.filter((doc) =>
  ["pan", "aadhaar", "bank-statements", "salary-slips", "address-proof", "photograph"].includes(doc.id)
);

const INITIAL_LOAN_DETAILS: LoanDetailsFormData = {
  loanType: "Personal Loan",
  requiredAmount: "",
  purpose: "",
  preferredTenureMonths: "",
  hasExistingLoans: false,
  existingEmi: "",
  monthlyIncomeOrTurnover: "",
  employmentType: "Salaried",
};

const INITIAL_BANKING_DETAILS: LoanBankingFormData = {
  primaryBankName: "",
  accountNumber: "",
  ifscCode: "",
};

export const PersonalLoanScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  const customer = useAuthStore((s) => s.customer);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConsentChecked, setIsConsentChecked] = useState(true);
  const { errors, setErrors, clearFieldError } = useLoanFormErrors();

  // Form State
  const [loanDetails, setLoanDetails] = useState<LoanDetailsFormData>(INITIAL_LOAN_DETAILS);
  const [bankingDetails, setBankingDetails] = useState<LoanBankingFormData>(INITIAL_BANKING_DETAILS);

  const [documents, setDocuments] = useState<LoanDocumentItem[]>(() =>
    JSON.parse(JSON.stringify(PERSONAL_LOAN_DOCUMENTS_TEMPLATE))
  );

  const scrollToTop = useCallback(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  const wizard = useLoanWizard({
    totalSteps: STEPS.length,
    validateStep: (stepIndex) => validateStep(stepIndex),
    onExitFromFirstStep: () => exitFromFirstStep(),
    onStepChange: scrollToTop,
  });
  const { currentStepIndex } = wizard;

  const isFormDirty = useCallback(() => {
    return Boolean(
      loanDetails.requiredAmount.trim() ||
        loanDetails.purpose.trim() ||
        loanDetails.preferredTenureMonths ||
        loanDetails.hasExistingLoans ||
        loanDetails.existingEmi.trim() ||
        loanDetails.monthlyIncomeOrTurnover.trim() ||
        bankingDetails.primaryBankName.trim() ||
        bankingDetails.accountNumber.trim() ||
        bankingDetails.ifscCode.trim() ||
        documents.some((document) => document.fileUri) ||
        currentStepIndex > 0
    );
  }, [bankingDetails, currentStepIndex, documents, loanDetails]);

  const {
    showDraftModal,
    openDraftModal,
    markSubmitted,
    handleSaveAndExit,
    handleDiscardAndExit,
    handleCancel,
    clearDraft,
  } = useServiceDraft({
    serviceKey: "personal-loan",
    formData: { currentStepIndex, loanDetails, bankingDetails, documents },
    isDirty: isFormDirty,
    onRestore: (saved) => {
      if (saved.loanDetails) setLoanDetails(saved.loanDetails);
      if (saved.bankingDetails) setBankingDetails(saved.bankingDetails);
      if (saved.documents) setDocuments(saved.documents);
      if (typeof saved.currentStepIndex === "number") {
        wizard.goToStep(saved.currentStepIndex);
      }
    },
    isSubmitted: isSubmitting,
  });

  const handleDetailsChange = (field: keyof LoanDetailsFormData, value: LoanDetailsFormData[keyof LoanDetailsFormData]) => {
    setLoanDetails((prev) => ({ ...prev, [field]: value }));
    clearFieldError(field);
  };

  const handleBankingChange = (field: keyof LoanBankingFormData, value: LoanBankingFormData[keyof LoanBankingFormData]) => {
    setBankingDetails((prev) => ({ ...prev, [field]: value }));
    clearFieldError(field);
  };

  const handleDocumentUploaded = (
    docId: string,
    fileUri: string,
    fileName: string,
    fileSize: string
  ) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === docId
          ? {
              ...d,
              fileUri,
              fileName,
              fileSize,
              uploadedAt: new Date().toISOString(),
            }
          : d
      )
    );
  };

  const handleDocumentRemoved = (docId: string) => {
    setDocuments((prev) =>
      prev.map((document) =>
        document.id === docId
          ? {
              ...document,
              fileUri: undefined,
              fileName: undefined,
              fileSize: undefined,
              uploadedAt: undefined,
            }
          : document
      )
    );
  };

  function validateStep(stepIndex: number): boolean {
    if (stepIndex === 0) {
      const errs = validateForm(loanDetails, personalLoanSchemas.financials);
      setErrors(errs);
      return Object.keys(errs).length === 0;
    }

    if (stepIndex === 1) {
      const errs = validateForm(bankingDetails, personalLoanSchemas.banking);
      setErrors(errs);
      return Object.keys(errs).length === 0;
    }

    if (stepIndex === 2) {
      const { isValid, missingDocs } = validateLoanDocuments(documents);
      if (!isValid) {
        Alert.alert(
          "Mandatory Documents Required",
          `Please upload all required personal documents to continue:\n\n• ${missingDocs.slice(0, 3).join("\n• ")}`
        );
        return false;
      }
      return true;
    }

    return true;
  }

  function exitFromFirstStep() {
    if (isFormDirty()) {
      openDraftModal();
    } else {
      router.back();
    }
  }

  const handleNext = () => {
    if (!wizard.isLastStep) {
      wizard.goToNextStep();
      return;
    }
    if (validateStep(currentStepIndex)) {
      handleSubmitApplication();
    }
  };

  const handleSubmitApplication = async () => {
    if (!isConsentChecked) {
      Alert.alert(
        "Consent Required",
        "Please check the authorization consent to lodge your personal loan."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const draft: Partial<LoanApplicationDraft> = {
        loanType: "Personal Loan",
        loanTypeId: "personal-loan",
        customerProfile: customer || undefined,
        loanDetails,
        bankingDetails,
        documents,
      };

      const response = await loansApi.applyLoan(draft);
      markSubmitted();
      await clearDraft();
      Alert.alert(
        "Personal Loan Submitted",
        `Your application (Ref: ${response.referenceNumber}) has been submitted. Our credit team will verify your dossier shortly.`,
        [
          {
            text: "Track Status",
            onPress: () => {
              router.replace(
                `/service/loan-status?id=${response.applicationId}&loanType=Personal+Loan&amount=${response.amount}`
              );
            },
          },
        ]
      );
    } catch {
      Alert.alert("Submission Error", "Failed to submit application. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderActiveStep = () => {
    switch (currentStepIndex) {
      case 0:
        return (
          <PersonalLoanFinancialsStep
            data={loanDetails}
            onChange={handleDetailsChange}
            errors={errors}
          />
        );
      case 1:
        return (
          <PersonalLoanBankingStep
            data={bankingDetails}
            onChange={handleBankingChange}
            errors={errors}
          />
        );
      case 2:
        return (
          <PersonalLoanDocumentsStep
            documents={documents}
            onDocumentUploaded={handleDocumentUploaded}
            onDocumentRemoved={handleDocumentRemoved}
            scrollRef={scrollViewRef}
          />
        );
      case 3:
      default:
        return (
          <PersonalLoanReviewStep
            loanDetails={loanDetails}
            bankingDetails={bankingDetails}
            documents={documents}
            profile={customer || undefined}
            isConsentChecked={isConsentChecked}
            onConsentToggle={setIsConsentChecked}
            onGoToStep={wizard.goToStep}
          />
        );
    }
  };

  const isFinalStep = wizard.isLastStep;

  return (
    <View style={[styles.safeArea, getSafeAreaTopPadding(insets.top)]}>
      {/* Header with Step X of 4 & Orange Linear Progress Bar (Matching Home Loan) */}
      <LoanStepIndicator
        variant="linear"
        title="Personal Loan"
        subtitle={STEPS[currentStepIndex]}
        currentStepIndex={currentStepIndex}
        totalSteps={STEPS.length}
        onBack={wizard.handleBack}
      />

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Scrollable Step Form with Keyboard Awareness */}
        <KeyboardAwareScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 16) + 30 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          enableAutomaticScroll={true}
          extraScrollHeight={60}
        >
          {renderActiveStep()}
        </KeyboardAwareScrollView>

        {/* Sticky Bottom Actions (Only Continue/Submit button, full width) */}
        <View style={[styles.bottomBar, getBottomBarPadding(insets.bottom)]}>
          <TouchableOpacity
            style={[styles.nextButton, isSubmitting && styles.nextButtonDisabled]}
            onPress={handleNext}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={BrandColors.WHITE} />
            ) : (
              <>
                <Text style={styles.nextButtonText}>
                  {isFinalStep ? "Submit Application" : "Continue"}
                </Text>
                <Ionicons
                  name={isFinalStep ? "shield-checkmark" : "arrow-forward"}
                  size={18}
                  color={BrandColors.WHITE}
                />
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <UniversalDraftModal
        visible={showDraftModal}
        title="Save Personal Loan Draft?"
        message="You have entered information for your personal loan. Save your progress to resume anytime."
        onSaveAndExit={handleSaveAndExit}
        onDiscardAndExit={handleDiscardAndExit}
        onCancel={handleCancel}
      />
    </View>
  );
};

export default PersonalLoanScreen;

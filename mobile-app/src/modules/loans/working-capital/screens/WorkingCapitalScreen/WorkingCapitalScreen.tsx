import React, { useState, useRef, useMemo, useCallback } from "react";
import {
  View,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../../../../authentication/store/authStore";
import { loansApi } from "../../../services/loansApi";
import { BUSINESS_DOCUMENTS_TEMPLATE } from "../../../mock/loanServices";
import { UniversalDraftModal } from "@/shared/components/UniversalDraftModal";
import { useUniversalDraftGuard } from "@/shared/hooks/useUniversalDraftGuard";
import { useApplicationStore } from "@/store/applicationStore";
import {
  LoanDetailsFormData,
  LoanBusinessFormData,
  LoanBankingFormData,
  LoanDocumentItem,
  LoanApplicationDraft,
  LoanEmploymentType,
} from "../../../types/loans.types";
import {
  validateLoanDetails,
  validateLoanBusiness,
  validateLoanBanking,
} from "../../../validation/loansSchema";
import { useLoanWizard } from "../../../hooks/useLoanWizard";
import { useLoanDocuments } from "../../../hooks/useLoanDocuments";
import { useLoanDraft } from "../../../hooks/useLoanDraft";
import { LOAN_DRAFT_STORAGE_KEYS } from "../../../constants/loanDraftKeys";
import { LoanProgressHeader, LOAN_PROGRESS_CONFIG } from "@/shared/components/LoanProgressHeader";
import { LoanNavigation } from "@/shared/components/LoanNavigation";
import { getBottomBarPadding, getSafeAreaTopPadding } from "../../../styles/loanScreenLayout.styles";
import {
  WorkingCapitalFinancialsStep,
  WorkingCapitalBusinessStep,
  WorkingCapitalBankingStep,
  WorkingCapitalReviewStep,
} from "../../components";
import { LoanDocumentCardListStep } from "../../../components/steps";
import { WORKING_CAPITAL_DOCUMENT_CATEGORIES } from "../../config/workingCapitalSteps.config";
import { styles } from "./WorkingCapitalScreen.styles";

const STEPS = LOAN_PROGRESS_CONFIG.workingCapital.steps;
/** Upload limit of the document picker this flow used before (2 MB). */
const WORKING_CAPITAL_MAX_FILE_SIZE_MB = 2;

const INITIAL_LOAN_DETAILS: LoanDetailsFormData = {
  loanType: "Working Capital",
  requiredAmount: "",
  purpose: "",
  preferredTenureMonths: "12",
  hasExistingLoans: false,
  existingEmi: "",
  monthlyIncomeOrTurnover: "",
  employmentType: "Cash Credit (CC) Facility" as LoanEmploymentType,
};

const INITIAL_BUSINESS_DETAILS: LoanBusinessFormData = {
  businessName: "",
  gstin: "",
  udyamRegistration: "",
  businessVintageYears: "3",
  annualTurnover: "",
  netProfit: "",
};

const INITIAL_BANKING_DETAILS: LoanBankingFormData = {
  primaryBankName: "",
  accountNumber: "",
  ifscCode: "",
  existingLenderName: "",
  existingLoanOutstanding: "",
  itrFilingStatus: "Filed",
  itrAckNumber: "",
  grossTotalIncome: "",
};

/** Persisted draft shape; field order matches the JSON this screen has always written. */
interface WorkingCapitalDraft {
  loanType: "Working Capital";
  loanTypeId: "working-capital";
  currentStepIndex: number;
  loanDetails?: LoanDetailsFormData;
  businessDetails?: LoanBusinessFormData;
  bankingDetails?: LoanBankingFormData;
  documents?: LoanDocumentItem[];
}

export const WorkingCapitalScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const customer = useAuthStore((s) => s.customer);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConsentChecked, setIsConsentChecked] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loanDetails, setLoanDetails] = useState<LoanDetailsFormData>(INITIAL_LOAN_DETAILS);
  const [businessDetails, setBusinessDetails] = useState<LoanBusinessFormData>(INITIAL_BUSINESS_DETAILS);
  const [bankingDetails, setBankingDetails] = useState<LoanBankingFormData>(INITIAL_BANKING_DETAILS);

  const loanDocuments = useLoanDocuments({
    template: BUSINESS_DOCUMENTS_TEMPLATE,
    maxSizeMB: WORKING_CAPITAL_MAX_FILE_SIZE_MB,
  });
  const { documents } = loanDocuments;

  const scrollToTop = useCallback(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  const wizard = useLoanWizard({
    totalSteps: STEPS.length,
    validateStep: (stepIndex) => validateStep(stepIndex),
    onExitFromFirstStep: () => openDraftModal(),
    onStepChange: scrollToTop,
  });
  const { currentStepIndex } = wizard;

  const draft = useLoanDraft<WorkingCapitalDraft>({
    storageKey: LOAN_DRAFT_STORAGE_KEYS.workingCapital,
    restoreOnMount: true,
    onRestore: (saved) => {
      if (saved.loanDetails) setLoanDetails(saved.loanDetails);
      if (saved.businessDetails) setBusinessDetails(saved.businessDetails);
      if (saved.bankingDetails) setBankingDetails(saved.bankingDetails);
      if (saved.documents) loanDocuments.setDocuments(saved.documents);
      if (typeof saved.currentStepIndex === "number") wizard.goToStep(saved.currentStepIndex);
    },
  });

  const isFormDirty = useMemo(
    () =>
      Boolean(loanDetails.requiredAmount.trim()) ||
      Boolean(loanDetails.purpose.trim()) ||
      Boolean(businessDetails.businessName.trim()) ||
      Boolean(bankingDetails.primaryBankName.trim()) ||
      documents.some((d) => Boolean(d.fileUri)) ||
      currentStepIndex > 0,
    [loanDetails, businessDetails, bankingDetails, documents, currentStepIndex]
  );

  const {
    showDraftModal,
    openDraftModal,
    markSubmitted,
    handleSaveAndExit,
    handleDiscardAndExit,
    handleCancel,
  } = useUniversalDraftGuard({
    isDirty: () => isFormDirty,
    onSaveDraft: () =>
      draft.saveDraft({
        loanType: "Working Capital",
        loanTypeId: "working-capital",
        currentStepIndex,
        loanDetails,
        businessDetails,
        bankingDetails,
        documents,
      }),
    onDiscardDraft: draft.clearDraft,
  });

  const clearFieldError = (field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleDetailsChange = <K extends keyof LoanDetailsFormData>(
    field: K,
    value: LoanDetailsFormData[K]
  ) => {
    setLoanDetails((prev) => ({ ...prev, [field]: value }));
    clearFieldError(field);
  };
  const handleBusinessChange = <K extends keyof LoanBusinessFormData>(field: K, value: LoanBusinessFormData[K]) => {
    setBusinessDetails((prev) => ({ ...prev, [field]: value }));
    clearFieldError(field);
  };
  const handleBankingChange = <K extends keyof LoanBankingFormData>(field: K, value: LoanBankingFormData[K]) => {
    setBankingDetails((prev) => ({ ...prev, [field]: value }));
    clearFieldError(field);
  };

  function validateStep(stepIndex: number): boolean {
    if (stepIndex === 0) {
      const errs = validateLoanDetails(loanDetails, { requireIncomeOrTurnover: false });
      setErrors(errs);
      return Object.keys(errs).length === 0;
    }

    if (stepIndex === 1) {
      const errs = { ...validateLoanBusiness(businessDetails), ...validateLoanBanking(bankingDetails) };
      setErrors(errs);
      return Object.keys(errs).length === 0;
    }

    if (stepIndex === 2) {
      const { isValid, missingDocs } = loanDocuments.validateDocuments();
      if (!isValid) {
        Alert.alert(
          "Mandatory Documents Required",
          `Please upload required documents to proceed:\n\n• ${missingDocs.slice(0, 3).join("\n• ")}`
        );
      }
      return isValid;
    }

    return true;
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

  const buildApplicationPayload = (): Partial<LoanApplicationDraft> => ({
    loanType: "Working Capital",
    loanTypeId: "working-capital",
    customerProfile: customer || undefined,
    loanDetails,
    businessDetails,
    bankingDetails,
    documents,
  });

  const handleSubmitApplication = async () => {
    if (!isConsentChecked) {
      Alert.alert(
        "Consent Required",
        "Please check the authorization declaration to submit your Working Capital credit application."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await loansApi.applyLoan(buildApplicationPayload());
      const appId = response.applicationId || `WC-2026-${Math.floor(10000 + Math.random() * 90000)}`;

      useApplicationStore.getState().createApplication(
        "working-capital",
        "Working Capital",
        "LOANS",
        {
          loanType: "Working Capital",
          requestedAmount: Number(loanDetails.requiredAmount) || 5000000,
          purpose: loanDetails.purpose,
          tenureMonths: loanDetails.preferredTenureMonths,
          businessName: businessDetails.businessName,
          gstin: businessDetails.gstin,
          udyamRegistration: businessDetails.udyamRegistration,
          businessVintage: businessDetails.businessVintageYears,
          annualTurnover: businessDetails.annualTurnover,
          netProfit: businessDetails.netProfit,
          bankName: bankingDetails.primaryBankName,
          accountNumber: bankingDetails.accountNumber,
          ifscCode: bankingDetails.ifscCode,
        },
        documents.map((d) => ({ name: d.name, status: d.fileUri ? "Uploaded" : "Pending", fileUri: d.fileUri })),
        0,
        "Paid",
        true
      );

      await draft.clearDraft();
      markSubmitted();
      const statusRoute: Href = `/service/loan-status?id=${appId}&loanType=Working+Capital`;
      router.replace(statusRoute);
    } catch {
      Alert.alert("Submission Error", "Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderActiveStep = () => {
    switch (currentStepIndex) {
      case 0:
        return <WorkingCapitalFinancialsStep data={loanDetails} onChange={handleDetailsChange} errors={errors} />;
      case 1:
        return (
          <>
            <WorkingCapitalBusinessStep data={businessDetails} onChange={handleBusinessChange} errors={errors} />
            <View style={styles.stepSpacer} />
            <WorkingCapitalBankingStep
              data={bankingDetails}
              onChange={handleBankingChange}
              errors={errors}
              hasExistingLoans={loanDetails.hasExistingLoans}
            />
          </>
        );
      case 2:
        return <LoanDocumentCardListStep categories={WORKING_CAPITAL_DOCUMENT_CATEGORIES} loanDocuments={loanDocuments} />;
      case 3:
      default:
        return (
          <WorkingCapitalReviewStep
            loanDetails={loanDetails}
            businessDetails={businessDetails}
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

  return (
    <View style={[styles.safeArea, getSafeAreaTopPadding(insets.top)]}>
      {/* Header with back, step title and progress bar */}
      <LoanProgressHeader
        title={LOAN_PROGRESS_CONFIG.workingCapital.title}
        currentStep={currentStepIndex + 1}
        totalSteps={STEPS.length}
        subtitle={STEPS[currentStepIndex]}
        onBack={openDraftModal}
      />

      {/* Scrollable Step Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderActiveStep()}
      </ScrollView>

      {/* Sticky Bottom Actions */}
      <LoanNavigation
        onNext={handleNext}
        isFirstStep={wizard.isFirstStep}
        isLastStep={wizard.isLastStep}
        isSubmitting={isSubmitting}
        containerStyle={getBottomBarPadding(insets.bottom)}
      />

      {/* Universal Draft Guard Modal */}
      <UniversalDraftModal
        visible={showDraftModal}
        title="Save Progress?"
        message="You have unsaved changes in your Working Capital Loan application. Save your progress to resume anytime."
        saveButtonText="Save as Draft & Exit"
        discardButtonText="Discard & Exit"
        cancelButtonText="Keep Editing"
        onSaveAndExit={handleSaveAndExit}
        onDiscardAndExit={handleDiscardAndExit}
        onCancel={handleCancel}
      />
    </View>
  );
};

export default WorkingCapitalScreen;

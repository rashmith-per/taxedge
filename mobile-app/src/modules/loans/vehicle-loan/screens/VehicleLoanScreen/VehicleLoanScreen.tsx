import React, { useState, useRef, useCallback } from "react";
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
import { useRouter, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "../../../../../shared/theme";
import { useAuthStore } from "../../../../authentication/store/authStore";
import { loansApi } from "../../../services/loansApi";
import { VEHICLE_LOAN_DOCUMENTS_TEMPLATE } from "../../constants/vehicleLoanDocuments";
import { UniversalDraftModal } from "@/shared/components/UniversalDraftModal";
import { useUniversalDraftGuard } from "@/shared/hooks/useUniversalDraftGuard";
import {
  LoanBusinessFormData,
  LoanBankingFormData,
  LoanApplicationDraft,
} from "../../../types/loans.types";
import {
  VehicleLoanDetailsFormData,
  VehicleLoanDraftData,
} from "../../types/vehicleLoan.types";
import {
  vehicleLoanSchemas,
  validateForm,
} from "../../../validation/loanValidationEngine";
import { useLoanWizard } from "../../../hooks/useLoanWizard";
import { useLoanFormErrors } from "../../../hooks/useLoanFormErrors";
import { useLoanDocuments } from "../../../hooks/useLoanDocuments";
import { useLoanDraft } from "../../../hooks/useLoanDraft";
import { LOAN_DRAFT_STORAGE_KEYS } from "../../../constants/loanDraftKeys";
import { LoanStepIndicator } from "../../../components/LoanStepIndicator";
import { KeyboardAwareScrollView } from "@/shared/components/KeyboardAwareFormLayout";
import { getBottomBarPadding, getSafeAreaTopPadding } from "../../../styles/loanScreenLayout.styles";
import {
  VehicleLoanFinancialsStep,
  VehicleLoanReviewStep,
} from "../../components";
import {
  LoanBankingStep,
  LoanEmploymentStep,
  LoanCategorizedDocumentsStep,
} from "../../../components/steps";
import {
  VEHICLE_LOAN_BANKING_STEP,
  VEHICLE_LOAN_EMPLOYMENT_STEP,
  VEHICLE_LOAN_DOCUMENT_CATEGORIES,
} from "../../config/vehicleLoanSteps.config";
import { styles } from "./VehicleLoanScreen.styles";

const STEPS = [
  "Vehicle & Loan Requirements",
  "Employment & Income",
  "Banking & ITR",
  "Document Dossier",
  "Review & Lodgement",
] as const;

const INITIAL_LOAN_DETAILS: VehicleLoanDetailsFormData = {
  loanType: "Vehicle Loan",
  requiredAmount: "",
  purpose: "",
  customPurpose: "",
  vehicleCondition: undefined,
  vehicleMakeModel: "",
  onRoadPrice: "",
  downPayment: "",
  registrationNumber: "",
  registrationYear: "",
  preferredTenureMonths: "",
  hasExistingLoans: false,
  existingEmi: "",
  monthlyIncomeOrTurnover: "",
  employmentType: "" as any,
};

const INITIAL_BUSINESS_DETAILS: LoanBusinessFormData = {
  businessName: "", gstin: "", udyamRegistration: "", businessVintageYears: "", annualTurnover: "", netProfit: "",
};

const INITIAL_BANKING_DETAILS: LoanBankingFormData = {
  primaryBankName: "", accountNumber: "", ifscCode: "", existingLenderName: "", existingLoanOutstanding: "",
  itrFilingStatus: "" as any, itrAckNumber: "", grossTotalIncome: "",
};

type VehicleLoanDraft = Omit<VehicleLoanDraftData, "savedAt">;

export const VehicleLoanScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const customer = useAuthStore((s) => s.customer);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConsentChecked, setIsConsentChecked] = useState(true);
  const { errors, setErrors, clearFieldError } = useLoanFormErrors();

  // Form State initialized to empty & unselected
  const [loanDetails, setLoanDetails] =
    useState<VehicleLoanDetailsFormData>(INITIAL_LOAN_DETAILS);
  const [businessDetails, setBusinessDetails] =
    useState<LoanBusinessFormData>(INITIAL_BUSINESS_DETAILS);
  const [bankingDetails, setBankingDetails] =
    useState<LoanBankingFormData>(INITIAL_BANKING_DETAILS);

  const loanDocuments = useLoanDocuments({
    template: VEHICLE_LOAN_DOCUMENTS_TEMPLATE,
    fileTypes: "withOfficeDocuments",
  });
  const { documents } = loanDocuments;

  const scrollToTop = useCallback(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  const isFormDirty = useCallback((): boolean => {
    const hasLoanDetails = Boolean(
      loanDetails.requiredAmount.trim() ||
        loanDetails.purpose.trim() ||
        loanDetails.customPurpose?.trim() ||
        loanDetails.vehicleCondition ||
        loanDetails.vehicleMakeModel?.trim() ||
        loanDetails.onRoadPrice?.trim() ||
        loanDetails.downPayment?.trim() ||
        loanDetails.registrationNumber?.trim() ||
        loanDetails.registrationYear?.trim() ||
        loanDetails.preferredTenureMonths ||
        loanDetails.hasExistingLoans ||
        loanDetails.existingEmi?.trim() ||
        loanDetails.monthlyIncomeOrTurnover?.trim() ||
        loanDetails.employmentType
    );

    const hasBusinessDetails = Boolean(
      businessDetails.businessName.trim() ||
        businessDetails.gstin?.trim() ||
        businessDetails.udyamRegistration?.trim() ||
        businessDetails.businessVintageYears?.trim() ||
        businessDetails.annualTurnover?.trim() ||
        businessDetails.netProfit?.trim()
    );

    const hasBankingDetails = Boolean(
      bankingDetails.primaryBankName.trim() ||
        bankingDetails.accountNumber.trim() ||
        bankingDetails.ifscCode.trim() ||
        bankingDetails.existingLenderName?.trim() ||
        bankingDetails.existingLoanOutstanding?.trim() ||
        bankingDetails.itrFilingStatus ||
        bankingDetails.itrAckNumber?.trim() ||
        bankingDetails.grossTotalIncome?.trim()
    );

    const hasDocuments = documents.some((d) => Boolean(d.fileUri));

    return hasLoanDetails || hasBusinessDetails || hasBankingDetails || hasDocuments;
  }, [loanDetails, businessDetails, bankingDetails, documents]);

  const wizard = useLoanWizard({
    totalSteps: STEPS.length,
    validateStep: (stepIndex) => validateStep(stepIndex),
    onExitFromFirstStep: () => router.back(),
    onStepChange: scrollToTop,
  });
  const { currentStepIndex } = wizard;

  const draft = useLoanDraft<VehicleLoanDraft>({
    storageKey: LOAN_DRAFT_STORAGE_KEYS.vehicleLoan,
    restoreOnMount: true,
    onRestore: (saved) => {
      if (saved.loanDetails) setLoanDetails(saved.loanDetails);
      if (saved.businessDetails) setBusinessDetails(saved.businessDetails);
      if (saved.bankingDetails) setBankingDetails(saved.bankingDetails);
      if (saved.documents) loanDocuments.setDocuments(saved.documents);
      if (typeof saved.currentStepIndex === "number") {
        wizard.goToStep(saved.currentStepIndex);
      }
    },
  });

  const {
    showDraftModal,
    openDraftModal,
    handleSaveAndExit,
    handleDiscardAndExit,
    handleCancel,
    markSubmitted,
  } = useUniversalDraftGuard({
    isDirty: isFormDirty,
    onSaveDraft: () => {
      void draft.saveDraft({
        loanDetails,
        businessDetails,
        bankingDetails,
        documents,
        currentStepIndex,
      });
    },
    onDiscardDraft: () => {
      void draft.clearDraft();
    },
  });

  const handleDetailsChange = (field: keyof VehicleLoanDetailsFormData, value: VehicleLoanDetailsFormData[keyof VehicleLoanDetailsFormData]) => {
    setLoanDetails((prev) => ({ ...prev, [field]: value }));
    clearFieldError(field);
  };

  const handleBusinessChange = (
    field: keyof LoanBusinessFormData,
    value: string
  ) => {
    setBusinessDetails((prev) => ({ ...prev, [field]: value }));
    clearFieldError(field);
  };

  const handleBankingChange = <K extends keyof LoanBankingFormData>(field: K, value: LoanBankingFormData[K]) => {
    setBankingDetails((prev) => ({ ...prev, [field]: value }));
    clearFieldError(field);
  };

  function validateStep(stepIndex: number): boolean {
    if (stepIndex === 0) {
      const errs = validateForm(loanDetails, vehicleLoanSchemas.financials);
      setErrors(errs);
      if (Object.keys(errs).length > 0) {
        Alert.alert("Required Details Missing", "Please enter loan amount, vehicle category, tenure, and vehicle details to continue.");
        return false;
      }
      return true;
    }

    if (stepIndex === 1) {
      const merged = { ...loanDetails, ...businessDetails };
      const errs = validateForm(merged, vehicleLoanSchemas.employment);
      setErrors(errs);
      if (Object.keys(errs).length > 0) {
        Alert.alert("Incomplete Profile", "Please select an employment category and enter your monthly net income to continue.");
        return false;
      }
      return true;
    }

    if (stepIndex === 2) {
      const errs = validateForm(bankingDetails, vehicleLoanSchemas.banking);
      setErrors(errs);
      if (Object.keys(errs).length > 0) {
        Alert.alert("Banking Details Missing", "Please enter your bank name, account number, IFSC code, and select ITR status to continue.");
        return false;
      }
      return true;
    }

    if (stepIndex === 3) {
      const { isValid, missingDocs } = loanDocuments.validateDocuments();
      if (!isValid) {
        Alert.alert("Mandatory Documents Required", `Please upload all required vehicle financing documents to continue:\n\n• ${missingDocs.slice(0, 3).join("\n• ")}`);
        return false;
      }
      return true;
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

  const handleSubmitApplication = async () => {
    if (!isConsentChecked) {
      Alert.alert("Consent Required", "Please check the authorization declaration to lodge your vehicle loan.");
      return;
    }
    setIsSubmitting(true);
    try {
      const application: Partial<LoanApplicationDraft> = {
        loanType: "Vehicle Loan",
        loanTypeId: "vehicle-loan",
        customerProfile: customer || undefined,
        loanDetails,
        businessDetails:
          loanDetails.employmentType !== "Salaried"
            ? businessDetails
            : undefined,
        bankingDetails,
        documents,
      };

      const response = await loansApi.applyLoan(application);
      markSubmitted();
      await draft.clearDraft();

      const statusRoute: Href = `/service/loan-status?id=${response.applicationId}&loanType=Vehicle+Loan&isSuccess=true`;
      router.replace(statusRoute);
    } catch {
      Alert.alert(
        "Submission Error",
        "Failed to submit application. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderActiveStep = () => {
    switch (currentStepIndex) {
      case 0:
        return <VehicleLoanFinancialsStep data={loanDetails} onChange={handleDetailsChange} errors={errors} />;
      case 1:
        return <LoanEmploymentStep config={VEHICLE_LOAN_EMPLOYMENT_STEP} data={loanDetails} onChangeDetails={handleDetailsChange} businessData={businessDetails} onChangeBusiness={handleBusinessChange} errors={errors} />;
      case 2:
        return <LoanBankingStep config={VEHICLE_LOAN_BANKING_STEP} data={bankingDetails} onChange={handleBankingChange} errors={errors} hasExistingLoans={loanDetails.hasExistingLoans} />;
      case 3:
        return <LoanCategorizedDocumentsStep categories={VEHICLE_LOAN_DOCUMENT_CATEGORIES} loanDocuments={loanDocuments} />;
      case 4:
      default:
        return (
          <VehicleLoanReviewStep
            loanDetails={loanDetails}
            businessDetails={loanDetails.employmentType !== "Salaried" ? businessDetails : undefined}
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
      {/* Header with Step X of 5 & Orange Linear Progress Bar */}
      <LoanStepIndicator
        variant="linear"
        title="Vehicle Loan"
        subtitle={STEPS[currentStepIndex]}
        currentStepIndex={currentStepIndex}
        totalSteps={STEPS.length}
        onBack={wizard.handleBack}
        onSettings={() =>
          Alert.alert(
            "Vehicle Loan Assistance",
            "Need help with your vehicle loan application? Contact support@taxedge.in or your assigned auto-credit manager."
          )
        }
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Scrollable Step Content with Keyboard Awareness */}
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

        {/* Sticky Bottom Navigation with Orange Theme */}
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
                  {wizard.isLastStep ? "Submit Application" : "Continue"}
                </Text>
                <Ionicons
                  name={wizard.isLastStep ? "shield-checkmark" : "arrow-forward"}
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
        title="Save Vehicle Loan Draft?"
        message="You have entered information for your vehicle loan. Save your progress to resume anytime without re-entering details."
        onSaveAndExit={handleSaveAndExit}
        onDiscardAndExit={handleDiscardAndExit}
        onCancel={handleCancel}
      />
    </View>
  );
};

export default VehicleLoanScreen;

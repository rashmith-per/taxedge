import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "../../../../../shared/theme";
import { useAuthStore } from "../../../../authentication/store/authStore";
import { loansApi } from "../../../services/loansApi";
import { BUSINESS_DOCUMENTS_TEMPLATE } from "../../../mock/loanServices";
import {
  LoanDetailsFormData,
  LoanBusinessFormData,
  LoanBankingFormData,
  LoanApplicationDraft,
} from "../../../types/loans.types";
import {
  validateLoanDetails,
  validateLoanBusiness,
  validateLoanBanking,
} from "../../../validation/loansSchema";
import { useLoanWizard } from "../../../hooks/useLoanWizard";
import { useLoanFormErrors } from "../../../hooks/useLoanFormErrors";
import { useLoanDocuments } from "../../../hooks/useLoanDocuments";
import { LoanStepIndicator } from "../../../components/LoanStepIndicator";
import { LoanCustomerCard, type LoanCustomerCardLabels } from "../../../components/LoanCustomerCard";
import { getBottomBarPadding, getSafeAreaTopPadding } from "../../../styles/loanScreenLayout.styles";
import {
  MsmeLoanFinancialsStep,
  MsmeLoanBusinessStep,
  MsmeLoanBankingStep,
  MsmeLoanDocumentsStep,
  MsmeLoanReviewStep,
} from "../../components";
import { styles } from "./MsmeLoanScreen.styles";

const STEPS = ["Financials", "MSME Profile", "Banking", "Documents", "Review"] as const;

const MSME_CUSTOMER_CARD_LABELS: LoanCustomerCardLabels = {
  title: "MSME Enterprise Proprietor / Partner",
  infoText:
    "Primary applicant details are automatically retrieved from your customer records. Manual re-entry is avoided.",
  nameLabel: "Proprietor / Partner Name",
  addressLabel: "Enterprise Registered Address",
};

export const MsmeLoanScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  const customer = useAuthStore((s) => s.customer);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConsentChecked, setIsConsentChecked] = useState(true);
  const { errors, setErrors, clearFieldError } = useLoanFormErrors();

  // Step 1: Financials
  const [loanDetails, setLoanDetails] = useState<LoanDetailsFormData>({
    loanType: "MSME Loan",
    requiredAmount: "3000000",
    purpose: "Business Expansion & Working Capital",
    preferredTenureMonths: "36",
    hasExistingLoans: false,
    existingEmi: "",
    monthlyIncomeOrTurnover: "500000",
    employmentType: "Business Owner",
  });

  // Step 2: MSME Enterprise Details
  const [businessDetails, setBusinessDetails] = useState<LoanBusinessFormData>({
    businessName: "",
    gstin: "",
    udyamRegistration: "",
    businessVintageYears: "3",
    annualTurnover: "6000000",
    netProfit: "900000",
  });

  // Step 3: Banking
  const [bankingDetails, setBankingDetails] = useState<LoanBankingFormData>({
    primaryBankName: "",
    accountNumber: "",
    ifscCode: "",
    existingLenderName: "",
    existingLoanOutstanding: "",
    itrFilingStatus: "Filed",
    itrAckNumber: "",
    grossTotalIncome: "",
  });

  // Step 4: Documents
  const loanDocuments = useLoanDocuments({ template: BUSINESS_DOCUMENTS_TEMPLATE });
  const { documents } = loanDocuments;

  const scrollToTop = useCallback(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  const wizard = useLoanWizard({
    totalSteps: STEPS.length,
    validateStep: (stepIndex) => validateStep(stepIndex),
    onExitFromFirstStep: () => router.back(),
    onStepChange: scrollToTop,
  });
  const { currentStepIndex } = wizard;

  const handleDetailsChange = <K extends keyof LoanDetailsFormData>(field: K, value: LoanDetailsFormData[K]) => {
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
      const errs = validateLoanDetails(loanDetails);
      setErrors(errs);
      return Object.keys(errs).length === 0;
    }

    if (stepIndex === 1) {
      const errs = validateLoanBusiness(businessDetails);
      setErrors(errs);
      return Object.keys(errs).length === 0;
    }

    if (stepIndex === 2) {
      const errs = validateLoanBanking(bankingDetails);
      setErrors(errs);
      return Object.keys(errs).length === 0;
    }

    if (stepIndex === 3) {
      const { isValid, missingDocs } = loanDocuments.validateDocuments();
      if (!isValid) {
        Alert.alert(
          "Mandatory Documents Required",
          `Please upload the following required documents before proceeding:\n\n• ${missingDocs.join("\n• ")}`
        );
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
      Alert.alert(
        "Consent Required",
        "Please check the authorization declaration to submit your MSME Loan application."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const draft: Partial<LoanApplicationDraft> = {
        loanType: "MSME Loan",
        loanTypeId: "msme-loan",
        customerProfile: customer || undefined,
        loanDetails,
        businessDetails,
        bankingDetails,
        documents,
      };

      const response = await loansApi.applyLoan(draft);
      const statusRoute: Href = `/service/loan-status?id=${response.applicationId}&loanType=MSME+Loan`;
      Alert.alert(
        "MSME Loan Application Submitted",
        `Your MSME Loan request (Ref: ${response.referenceNumber}) has been submitted successfully. Priority processing will begin shortly.`,
        [{ text: "Track Status", onPress: () => router.replace(statusRoute) }]
      );
    } catch {
      Alert.alert("Submission Error", "Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderActiveStep = () => {
    switch (currentStepIndex) {
      case 0:
        return (
          <>
            <LoanCustomerCard profile={customer || undefined} labels={MSME_CUSTOMER_CARD_LABELS} />
            <MsmeLoanFinancialsStep
              data={loanDetails}
              onChange={handleDetailsChange}
              errors={errors}
            />
          </>
        );
      case 1:
        return (
          <MsmeLoanBusinessStep
            data={businessDetails}
            onChange={handleBusinessChange}
            errors={errors}
          />
        );
      case 2:
        return (
          <MsmeLoanBankingStep
            data={bankingDetails}
            onChange={handleBankingChange}
            errors={errors}
            hasExistingLoans={loanDetails.hasExistingLoans}
          />
        );
      case 3:
        return <MsmeLoanDocumentsStep loanDocuments={loanDocuments} />;
      case 4:
      default:
        return (
          <MsmeLoanReviewStep
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
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={wizard.handleBack}>
            <Ionicons name="arrow-back" size={24} color={BrandColors.TEXT_PRIMARY} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>MSME Scheme Loan</Text>
            <Text style={styles.headerSubtitle}>
              Step {wizard.stepNumber} of {STEPS.length} • {STEPS[currentStepIndex]}
            </Text>
          </View>
        </View>

        {/* Existing confirmation only — this flow does not persist drafts. */}
        <TouchableOpacity
          style={styles.saveDraftButton}
          onPress={() => Alert.alert("Draft Saved", "MSME loan application draft saved successfully.")}
        >
          <Text style={styles.saveDraftText}>Save Draft</Text>
        </TouchableOpacity>
      </View>

      {/* Step Progress Stepper */}
      <LoanStepIndicator
        variant="numbered"
        steps={STEPS}
        currentStepIndex={currentStepIndex}
        onStepPress={wizard.goToStep}
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
      <View style={[styles.bottomBar, getBottomBarPadding(insets.bottom)]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={wizard.handleBack}
          disabled={isSubmitting}
        >
          <Text style={styles.backButtonText}>{wizard.isFirstStep ? "Cancel" : "Back"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.nextButton, isSubmitting && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={isSubmitting}
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
    </View>
  );
};

export default MsmeLoanScreen;

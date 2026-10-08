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
import { PROPERTY_LOAN_DOCUMENTS_TEMPLATE } from "../../../mock/loanServices";
import {
  LoanDetailsFormData,
  LoanApplicantFormData,
  LoanPropertyFormData,
  LoanOwnershipFormData,
  LoanApplicationDraft,
} from "../../../types/loans.types";
import { useLoanWizard } from "../../../hooks/useLoanWizard";
import { useLoanFormErrors } from "../../../hooks/useLoanFormErrors";
import { useLoanDocuments } from "../../../hooks/useLoanDocuments";
import { LoanStepIndicator } from "../../../components/LoanStepIndicator";
import { KeyboardAwareScrollView } from "@/shared/components/KeyboardAwareFormLayout";
import { getBottomBarPadding, getSafeAreaTopPadding } from "../../../styles/loanScreenLayout.styles";
import {
  PropertyLoanFinancialsStep,
  PropertyLoanApplicantStep,
  PropertyLoanPropertyStep,
  PropertyLoanOwnershipStep,
  PropertyLoanDocumentsStep,
  PropertyLoanReviewStep,
} from "../../components";
import { validatePropertyLoanStep } from "../../utils/propertyLoanValidators";
import {
  initialLoanDetails,
  initialApplicantDetails,
  initialPropertyDetails,
  initialOwnershipDetails,
  STEPS,
} from "../../utils/propertyLoanInitialState";
import { styles } from "./PropertyLoanScreen.styles";

export const PropertyLoanScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const customer = useAuthStore((s) => s.customer);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConsentChecked, setIsConsentChecked] = useState(true);
  const { errors, setErrors, clearFieldError } = useLoanFormErrors();

  const [loanDetails, setLoanDetails] = useState<LoanDetailsFormData>(initialLoanDetails);
  const [applicantDetails, setApplicantDetails] = useState<LoanApplicantFormData>(initialApplicantDetails);
  const [propertyDetails, setPropertyDetails] = useState<LoanPropertyFormData>(initialPropertyDetails);
  const [ownershipDetails, setOwnershipDetails] = useState<LoanOwnershipFormData>(initialOwnershipDetails);

  const loanDocuments = useLoanDocuments({
    template: PROPERTY_LOAN_DOCUMENTS_TEMPLATE,
    fileTypes: "withOfficeDocuments",
  });
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

  const handleDetailsChange = (
    field: keyof LoanDetailsFormData,
    value: string | number | boolean | null
  ) => {
    setLoanDetails((prev) => ({ ...prev, [field]: value }));
    clearFieldError(field);
  };

  const handleApplicantChange = (
    field: keyof LoanApplicantFormData,
    value: string | boolean | null
  ) => {
    setApplicantDetails((prev) => ({ ...prev, [field]: value }));
    clearFieldError(field);
  };

  const handlePropertyChange = (field: keyof LoanPropertyFormData, value: string) => {
    setPropertyDetails((prev) => ({ ...prev, [field]: value }));
    clearFieldError(field);
  };

  const handleOwnershipChange = (field: keyof LoanOwnershipFormData, value: string | boolean) => {
    setOwnershipDetails((prev) => ({ ...prev, [field]: value }));
    clearFieldError(field);
  };

  function validateStep(stepIndex: number): boolean {
    const result = validatePropertyLoanStep({
      currentStepIndex: stepIndex,
      loanDetails,
      applicantDetails,
      propertyDetails,
      ownershipDetails,
      documents,
    });

    if (!result.isValid) {
      setErrors(result.errors);
      if (result.alertTitle && result.alertMessage) {
        Alert.alert(result.alertTitle, result.alertMessage);
      }
      return false;
    }

    setErrors({});
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
    setIsSubmitting(true);
    try {
      const draft: Partial<LoanApplicationDraft> = {
        loanType: "Property Loan",
        loanTypeId: "property-loan",
        customerProfile: customer || undefined,
        loanDetails,
        applicantDetails,
        propertyDetails,
        ownershipDetails,
        documents,
      };

      const response = await loansApi.applyLoan(draft);
      Alert.alert(
        "Application Submitted",
        `Your Loan Against Property application has been submitted successfully.\nApplication ID: ${response.applicationId}`,
        [
          {
            text: "View Status",
            onPress: () => {
              const statusUrl: Href = `/service/loan-status?id=${encodeURIComponent(
                response.applicationId
              )}&loanType=${encodeURIComponent("Property Loan")}`;
              router.replace(statusUrl);
            },
          },
        ]
      );
    } catch {
      Alert.alert(
        "Submission Failed",
        "Unable to submit your application. Please check your network connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderActiveStep = () => {
    switch (currentStepIndex) {
      case 0:
        return (
          <PropertyLoanFinancialsStep
            data={loanDetails}
            onChange={handleDetailsChange}
            errors={errors}
          />
        );
      case 1:
        return (
          <PropertyLoanApplicantStep
            data={applicantDetails}
            onChange={handleApplicantChange}
            errors={errors}
          />
        );
      case 2:
        return (
          <PropertyLoanPropertyStep
            data={propertyDetails}
            onChange={handlePropertyChange}
            errors={errors}
          />
        );
      case 3:
        return (
          <PropertyLoanOwnershipStep
            data={ownershipDetails}
            onChange={handleOwnershipChange}
            errors={errors}
          />
        );
      case 4:
        return <PropertyLoanDocumentsStep loanDocuments={loanDocuments} />;
      case 5:
      default:
        return (
          <PropertyLoanReviewStep
            loanDetails={loanDetails}
            applicantDetails={applicantDetails}
            propertyDetails={propertyDetails}
            ownershipDetails={ownershipDetails}
            documents={documents}
            isConsentChecked={isConsentChecked}
            onConsentToggle={setIsConsentChecked}
            onGoToStep={wizard.goToStep}
          />
        );
    }
  };

  return (
    <View style={[styles.safeArea, getSafeAreaTopPadding(insets.top)]}>
      {/* Top Header */}
      <LoanStepIndicator
        variant="linear"
        title="Property Loan"
        subtitle={STEPS[currentStepIndex]}
        currentStepIndex={currentStepIndex}
        totalSteps={STEPS.length}
        onBack={wizard.handleBack}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Step Content with Keyboard Awareness */}
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

        {/* Bottom Sticky Action Bar */}
        <View style={[styles.bottomBar, getBottomBarPadding(insets.bottom)]}>
          <TouchableOpacity
            style={[styles.continueBtn, isSubmitting && styles.continueBtnDisabled]}
            onPress={handleNext}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color={BrandColors.WHITE} size="small" />
            ) : (
              <>
                <Text style={styles.continueBtnText}>
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
    </View>
  );
};

export default PropertyLoanScreen;

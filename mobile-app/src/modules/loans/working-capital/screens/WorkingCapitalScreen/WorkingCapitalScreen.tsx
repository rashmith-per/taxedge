import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "../../../../../shared/theme";
import { useAuthStore } from "../../../../authentication/store/authStore";
import { loansApi } from "../../../services/loansApi";
import { BUSINESS_DOCUMENTS_TEMPLATE } from "../../../mock/loanServices";
import { UniversalDraftModal } from "@/shared/components/UniversalDraftModal";
import { useUniversalDraftGuard } from "@/shared/hooks/useUniversalDraftGuard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useApplicationStore } from "@/store/applicationStore";
import {
  LoanDetailsFormData,
  LoanBusinessFormData,
  LoanBankingFormData,
  LoanDocumentItem,
  LoanApplicationDraft,
} from "../../../types/loans.types";
import {
  validateLoanDetails,
  validateLoanBusiness,
  validateLoanBanking,
  validateLoanDocuments,
} from "../../../validation/loansSchema";
import {
  WorkingCapitalStepIndicator,
  WorkingCapitalFinancialsStep,
  WorkingCapitalBusinessStep,
  WorkingCapitalBankingStep,
  WorkingCapitalDocumentsStep,
  WorkingCapitalReviewStep,
} from "../../components";
import { styles } from "./WorkingCapitalScreen.styles";

const STEPS = ["Financials", "Business & Banking", "Documents", "Review"];

export const WorkingCapitalScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  const customer = useAuthStore((s) => s.customer);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConsentChecked, setIsConsentChecked] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step 1: Financials
  const [loanDetails, setLoanDetails] = useState<LoanDetailsFormData>({
    loanType: "Working Capital",
    requiredAmount: "",
    purpose: "",
    preferredTenureMonths: "12",
    hasExistingLoans: false,
    existingEmi: "",
    monthlyIncomeOrTurnover: "",
    employmentType: "Cash Credit (CC) Facility" as any,
  });

  // Step 2: Business details
  const [businessDetails, setBusinessDetails] = useState<LoanBusinessFormData>({
    businessName: "",
    gstin: "",
    udyamRegistration: "",
    businessVintageYears: "3",
    annualTurnover: "",
    netProfit: "",
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
  const [documents, setDocuments] = useState<LoanDocumentItem[]>(() =>
    JSON.parse(JSON.stringify(BUSINESS_DOCUMENTS_TEMPLATE))
  );

  useEffect(() => {
    const loadDraft = async () => {
      try {
        const raw = await AsyncStorage.getItem("@taxedge_working_capital_draft_v1");
        if (raw) {
          const draft = JSON.parse(raw);
          if (draft.loanDetails) setLoanDetails(draft.loanDetails);
          if (draft.businessDetails) setBusinessDetails(draft.businessDetails);
          if (draft.bankingDetails) setBankingDetails(draft.bankingDetails);
          if (draft.documents) setDocuments(draft.documents);
          if (typeof draft.currentStepIndex === "number") {
            setCurrentStepIndex(draft.currentStepIndex);
          }
        }
      } catch {
        // Ignore
      }
    };
    loadDraft();
  }, []);

  const isFormDirty = useMemo(() => {
    const hasAmount = Boolean(loanDetails.requiredAmount.trim());
    const hasPurpose = Boolean(loanDetails.purpose.trim());
    const hasBusiness = Boolean(businessDetails.businessName.trim());
    const hasBank = Boolean(bankingDetails.primaryBankName.trim());
    const hasDocs = documents.some((d) => Boolean(d.fileUri));
    return hasAmount || hasPurpose || hasBusiness || hasBank || hasDocs || currentStepIndex > 0;
  }, [loanDetails, businessDetails, bankingDetails, documents, currentStepIndex]);

  const {
    showDraftModal,
    openDraftModal,
    markSubmitted,
    handleSaveAndExit,
    handleDiscardAndExit,
    handleCancel,
  } = useUniversalDraftGuard({
    isDirty: () => isFormDirty,
    onSaveDraft: async () => {
      try {
        const draft = {
          loanType: "Working Capital",
          loanTypeId: "working-capital",
          currentStepIndex,
          loanDetails,
          businessDetails,
          bankingDetails,
          documents,
          savedAt: new Date().toISOString(),
        };
        await AsyncStorage.setItem(
          "@taxedge_working_capital_draft_v1",
          JSON.stringify(draft)
        );
      } catch {
        // Ignore storage errors
      }
    },
    onDiscardDraft: async () => {
      try {
        await AsyncStorage.removeItem("@taxedge_working_capital_draft_v1");
      } catch {
        // Ignore storage errors
      }
    },
  });

  const handleDetailsChange = (field: keyof LoanDetailsFormData, value: any) => {
    setLoanDetails((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleBusinessChange = (
    field: keyof LoanBusinessFormData,
    value: any
  ) => {
    setBusinessDetails((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleBankingChange = (
    field: keyof LoanBankingFormData,
    value: string
  ) => {
    setBankingDetails((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
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

  const validateCurrentStep = (): boolean => {
    if (currentStepIndex === 0) {
      const errs = validateLoanDetails(loanDetails, { requireIncomeOrTurnover: false });
      setErrors(errs);
      return Object.keys(errs).length === 0;
    }

    if (currentStepIndex === 1) {
      const errsBus = validateLoanBusiness(businessDetails);
      const errsBank = validateLoanBanking(bankingDetails);
      const mergedErrs = { ...errsBus, ...errsBank };
      setErrors(mergedErrs);
      return Object.keys(mergedErrs).length === 0;
    }

    if (currentStepIndex === 2) {
      const { isValid, missingDocs } = validateLoanDocuments(documents);
      if (!isValid) {
        Alert.alert(
          "Mandatory Documents Required",
          `Please upload required documents to proceed:\n\n• ${missingDocs.slice(0, 3).join("\n• ")}`
        );
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      return;
    }

    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      handleSubmitApplication();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      openDraftModal();
    }
  };

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
      const draft: Partial<LoanApplicationDraft> = {
        loanType: "Working Capital",
        loanTypeId: "working-capital",
        customerProfile: customer || undefined,
        loanDetails,
        businessDetails,
        bankingDetails,
        documents,
      };

      const response = await loansApi.applyLoan(draft);
      const appId = response.applicationId || `WC-2026-${Math.floor(10000 + Math.random() * 90000)}`;

      // Save application into store so it appears in My Applications / Application Overview
      const appStore = useApplicationStore.getState();
      const amountVal = Number(loanDetails.requiredAmount) || 5000000;
      appStore.createApplication(
        "working-capital",
        "Working Capital",
        "LOANS",
        {
          loanType: "Working Capital",
          requestedAmount: amountVal,
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
        documents.map((d) => ({
          name: d.name,
          status: d.fileUri ? "Uploaded" : "Pending",
          fileUri: d.fileUri,
        })),
        0,
        "Paid",
        true
      );

      // Remove Working Capital draft from storage
      await AsyncStorage.removeItem("@taxedge_working_capital_draft_v1");

      // Mark submitted so draft guard beforeRemove listener does not intercept navigation
      markSubmitted();

      // Navigate directly to Loan Application Status screen
      router.replace(
        `/service/loan-status?id=${appId}&loanType=Working+Capital` as any
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
          <WorkingCapitalFinancialsStep
            data={loanDetails}
            onChange={handleDetailsChange}
            errors={errors}
          />
        );
      case 1:
        return (
          <>
            <WorkingCapitalBusinessStep
              data={businessDetails}
              onChange={handleBusinessChange}
              errors={errors}
            />
            <View style={{ height: 16 }} />
            <WorkingCapitalBankingStep
              data={bankingDetails}
              onChange={handleBankingChange}
              errors={errors}
              hasExistingLoans={loanDetails.hasExistingLoans}
            />
          </>
        );
      case 2:
        return (
          <WorkingCapitalDocumentsStep
            documents={documents}
            onDocumentUploaded={handleDocumentUploaded}
          />
        );
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
            onGoToStep={(stepIdx) => {
              setCurrentStepIndex(stepIdx);
              scrollViewRef.current?.scrollTo({ y: 0, animated: true });
            }}
          />
        );
    }
  };

  const isFinalStep = currentStepIndex === STEPS.length - 1;

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.circularBtn} onPress={openDraftModal} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={20} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.headerCenterContent}>
          <Text style={styles.headerTitle}>Working Capital</Text>
          <Text style={styles.headerSubtitle}>
            Step {currentStepIndex + 1} of {STEPS.length} • {STEPS[currentStepIndex]}
          </Text>
        </View>

        <View style={{ width: 36 }} />
      </View>

      {/* Step Progress Bar (Home Loan Style) */}
      <WorkingCapitalStepIndicator
        steps={STEPS}
        currentStepIndex={currentStepIndex}
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
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 12) },
        ]}
      >
        {currentStepIndex > 0 ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            disabled={isSubmitting}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        ) : null}

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

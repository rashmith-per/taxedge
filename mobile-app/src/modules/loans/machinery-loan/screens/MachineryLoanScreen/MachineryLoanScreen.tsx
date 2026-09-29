import React, { useState, useRef } from "react";
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
import { useApplicationStore } from "../../../../../store/applicationStore";
import { loansApi } from "../../../services/loansApi";
import { MACHINERY_DOCUMENTS_TEMPLATE } from "../../../mock/loanServices";
import {
  LoanDetailsFormData,
  LoanBusinessFormData,
  LoanBankingFormData,
  LoanDocumentItem,
  LoanApplicationDraft,
} from "../../../types/loans.types";
import {
  validateGstin,
} from "../../../../../shared/validators/indianTaxValidators";
import {
  MachineryLoanStepIndicator,
  MachineryLoanFinancialsStep,
  MachineryLoanBusinessStep,
  MachineryLoanBankingStep,
  MachineryLoanDocumentsStep,
  MachineryLoanReviewStep,
} from "../../components";
import { styles } from "./MachineryLoanScreen.styles";

const STEPS = ["Loan Details", "Business Details", "Banking", "Documents & Review"];

export const MachineryLoanScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  const customer = useAuthStore((s) => s.customer);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConsentChecked, setIsConsentChecked] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step 1: Loan Details
  const [loanDetails, setLoanDetails] = useState<LoanDetailsFormData>({
    loanType: "Machinery Loan",
    requiredAmount: "3000000",
    purpose: "CNC / Automation Machinery",
    preferredTenureMonths: "48",
    hasExistingLoans: false,
    existingEmi: "",
    monthlyIncomeOrTurnover: "",
    employmentType: "Business Owner",
  });

  // Step 2: Business Details
  const [businessDetails, setBusinessDetails] = useState<LoanBusinessFormData>({
    businessName: "",
    businessType: "Proprietorship",
    businessVintageYears: "3–5 years",
    annualTurnover: "",
    isGstRegistered: false,
    gstin: "",
    netProfit: "0",
  });

  // Step 3: Banking Details
  const [bankingDetails, setBankingDetails] = useState<LoanBankingFormData>({
    primaryBankName: "",
    accountNumber: "",
    ifscCode: "",
  });

  // Step 4: Documents
  const [documents, setDocuments] = useState<LoanDocumentItem[]>(() =>
    JSON.parse(JSON.stringify(MACHINERY_DOCUMENTS_TEMPLATE))
  );

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
    const newErrors: Record<string, string> = {};

    if (currentStepIndex === 0) {
      if (!loanDetails.requiredAmount) {
        newErrors.requiredAmount = "Select required loan amount";
      }
      if (!loanDetails.purpose) {
        newErrors.purpose = "Select equipment type";
      } else if (
        loanDetails.purpose === "Other" &&
        (!loanDetails.customEquipmentType || !loanDetails.customEquipmentType.trim())
      ) {
        newErrors.customEquipmentType = "Specify machinery/equipment details";
      }
      if (!loanDetails.preferredTenureMonths) {
        newErrors.preferredTenureMonths = "Select repayment tenure";
      }
    }

    if (currentStepIndex === 1) {
      if (!businessDetails.businessName || !businessDetails.businessName.trim()) {
        newErrors.businessName = "Enter business name";
      }
      if (!businessDetails.businessType) {
        newErrors.businessType = "Select business type";
      }
      if (!businessDetails.businessVintageYears) {
        newErrors.businessVintageYears = "Select business vintage";
      }
      if (!businessDetails.annualTurnover || !businessDetails.annualTurnover.trim()) {
        newErrors.annualTurnover = "Enter annual turnover";
      }
      if (businessDetails.isGstRegistered) {
        if (!businessDetails.gstin || !businessDetails.gstin.trim()) {
          newErrors.gstin = "GSTIN is required for GST registered business";
        } else if (!validateGstin(businessDetails.gstin.trim())) {
          newErrors.gstin = "Enter valid 15-character GSTIN";
        }
      }
    }

    if (currentStepIndex === 2) {
      if (!bankingDetails.primaryBankName || !bankingDetails.primaryBankName.trim()) {
        newErrors.primaryBankName = "Enter bank name";
      }
      const acc = (bankingDetails.accountNumber || "").trim();
      if (!acc || !/^\d{9,18}$/.test(acc)) {
        newErrors.accountNumber = "Enter valid current account number (9-18 digits)";
      }
      const ifsc = (bankingDetails.ifscCode || "").trim().toUpperCase();
      if (!ifsc || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) {
        newErrors.ifscCode = "Enter valid 11-character IFSC code";
      }
    }

    if (currentStepIndex === 3) {
      const missingRequired = documents.filter(
        (d) => d.required && (!d.fileUri || !d.fileUri.trim())
      );
      if (missingRequired.length > 0) {
        Alert.alert(
          "Required Documents Missing",
          `Please upload mandatory files:\n\n• ${missingRequired.map((d) => d.name).join("\n• ")}`
        );
        return false;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      router.back();
    }
  };

  const handleSubmitApplication = async () => {
    if (!isConsentChecked) {
      Alert.alert(
        "Consent Required",
        "Please check the authorization declaration to submit your Machinery Loan application."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const draft: Partial<LoanApplicationDraft> = {
        loanType: "Machinery Loan",
        loanTypeId: "machinery-loan",
        customerProfile: customer || undefined,
        loanDetails,
        businessDetails,
        bankingDetails,
        documents,
      };

      const response = await loansApi.applyLoan(draft);
      const appId = response.applicationId || `MCH-2026-${Math.floor(10000 + Math.random() * 90000)}`;

      // Create & store application into store so it appears in My Applications
      const appStore = useApplicationStore.getState();
      const amountVal = Number(loanDetails.requiredAmount) || 3000000;
      appStore.createApplication(
        "machinery-loan",
        "Machinery Loan",
        "LOANS",
        {
          loanType: "Machinery Loan",
          requestedAmount: amountVal,
          equipmentType: loanDetails.customEquipmentType || loanDetails.purpose,
          tenureMonths: loanDetails.preferredTenureMonths,
          businessName: businessDetails.businessName,
          businessType: businessDetails.businessType,
          businessVintage: businessDetails.businessVintageYears,
          annualTurnover: businessDetails.annualTurnover,
          isGstRegistered: businessDetails.isGstRegistered,
          gstin: businessDetails.gstin,
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

      Alert.alert(
        "Machinery Loan Submitted",
        `Your application (Ref: ${response.referenceNumber || appId}) has been submitted. Our TaxEdge Loan Agent will process the application shortly.`,
        [
          {
            text: "Track Status",
            onPress: () => {
              router.replace(
                `/service/loan-status?id=${appId}&loanType=Machinery+Loan` as any
              );
            },
          },
        ]
      );
    } catch {
      Alert.alert("Submission Error", "Failed to lodge application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderActiveStep = () => {
    switch (currentStepIndex) {
      case 0:
        return (
          <MachineryLoanFinancialsStep
            data={loanDetails}
            onChange={handleDetailsChange}
            errors={errors}
          />
        );
      case 1:
        return (
          <MachineryLoanBusinessStep
            data={businessDetails}
            onChange={handleBusinessChange}
            errors={errors}
          />
        );
      case 2:
        return (
          <MachineryLoanBankingStep
            data={bankingDetails}
            onChange={handleBankingChange}
            errors={errors}
            hasExistingLoans={false}
          />
        );
      case 3:
      default:
        return (
          <>
            <MachineryLoanDocumentsStep
              documents={documents}
              onDocumentUploaded={handleDocumentUploaded}
            />
            <View style={{ height: 24 }} />
            <MachineryLoanReviewStep
              loanDetails={loanDetails}
              businessDetails={businessDetails}
              bankingDetails={bankingDetails}
              documents={documents}
              isConsentChecked={isConsentChecked}
              onConsentToggle={setIsConsentChecked}
              onGoToStep={(stepIdx) => {
                setCurrentStepIndex(stepIdx);
                scrollViewRef.current?.scrollTo({ y: 0, animated: true });
              }}
            />
          </>
        );
    }
  };

  const isFinalStep = currentStepIndex === STEPS.length - 1;

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Machinery Loan</Text>
            <Text style={styles.headerSubtitle}>
              Step {currentStepIndex + 1} of {STEPS.length} • {STEPS[currentStepIndex]}
            </Text>
          </View>
        </View>
      </View>

      {/* Step Progress Stepper */}
      <MachineryLoanStepIndicator
        steps={STEPS}
        currentStepIndex={currentStepIndex}
        onStepPress={(idx) => {
          if (idx <= currentStepIndex) {
            setCurrentStepIndex(idx);
          }
        }}
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          disabled={isSubmitting}
        >
          <Text style={styles.backButtonText}>
            {currentStepIndex === 0 ? "Back" : "Back"}
          </Text>
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
    </View>
  );
};

export default MachineryLoanScreen;


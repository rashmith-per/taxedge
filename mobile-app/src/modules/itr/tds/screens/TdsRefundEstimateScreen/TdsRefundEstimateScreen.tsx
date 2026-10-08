import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { UniversalDraftModal } from "@/shared/components/UniversalDraftModal";
import { useUniversalDraftGuard } from "@/shared/hooks/useUniversalDraftGuard";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { useApplicationStore } from "@/store/applicationStore";
import { TdsCustomerIncomeFormData } from "../../types/customerIncome.types";
import { TdsChecklistItem } from "../../types/checklist.types";
import { TaxCalculationBreakdown } from "../../types/estimate.types";
import { formatCurrency } from "../../utils/tdsValidation";
import { tdsDraftService, INITIAL_TDS_FORM_DATA } from "../../services/tdsDraftService";
import { tdsCalculationService } from "../../services/tdsCalculationService";
import { tdsApiService } from "../../services/tdsApiService";
import { TaxCalculationBreakdownCard } from "../../components/estimate/TaxCalculationBreakdownCard";
import { ReviewSectionCard } from "../../components/estimate/ReviewSectionCard";
import { useTdsProgressStore } from "../../store/tdsProgressStore";
import { styles } from "./TdsRefundEstimateScreen.styles";
import { getErrorMessage } from "@/core/error-handling/errorMessage";
import { logger } from "@/core/logging/logger";

export const TdsRefundEstimateScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [formData, setFormData] = useState<TdsCustomerIncomeFormData>(INITIAL_TDS_FORM_DATA);
  const [documents, setDocuments] = useState<TdsChecklistItem[]>([]);
  const [calculation, setCalculation] = useState<TaxCalculationBreakdown | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    showDraftModal,
    openDraftModal,
    handleSaveAndExit,
    handleDiscardAndExit,
    handleCancel,
  } = useUniversalDraftGuard({
    saveDestination: "/service/itr",
    discardDestination: "/service/itr",
    isDirty: () => true,
    onSaveDraft: () => {
      useApplicationStore.getState().saveTdsDraft({ step: "ESTIMATE" });
    },
    onDiscardDraft: () => {
      tdsDraftService.clearDraft();
      useApplicationStore.getState().clearTdsDraft();
    },
    isSubmitted: () => isSubmitting,
  });

  useEffect(() => {
    useTdsProgressStore.getState().setMaxStepReached(3);

    let isMounted = true;
    (async () => {
      const savedForm = await tdsDraftService.getFormDraft();
      const savedDocs = await tdsDraftService.getDocumentsDraft();
      const existingAppId = await tdsDraftService.getApplicationId();

      const custId = savedForm.personal?.mobileNumber
        ? savedForm.personal.mobileNumber.replace(/\D/g, "")
        : "CUST-DEFAULT";

      let finalForm = savedForm;
      let finalDocs = savedDocs || [];

      try {
        const backendApp = await tdsApiService.fetchFullTdsApplication(custId, existingAppId || undefined);
        if (backendApp) {
          if (backendApp.bank) finalForm.bank = { ...finalForm.bank, ...backendApp.bank };
          if (backendApp.income) finalForm.income = { ...finalForm.income, ...backendApp.income };
          if (backendApp.documents && backendApp.documents.length > 0) {
            // TdsDocStatus has no 'verified'; kept as a defensive check for backend-reported status.
            const hasBackendUploaded = backendApp.documents.some((d) => d.status === 'uploaded' || (d.status as string) === 'verified');
            if (hasBackendUploaded) {
              finalDocs = backendApp.documents as any;
            }
          }
        }
      } catch (err) {
        logger.warn("[TdsRefundEstimateScreen] Backend fetch warning:", { error: err });
      }

      if (isMounted) {
        setFormData(finalForm);
        setDocuments(finalDocs);

        const calcResult = tdsCalculationService.calculate(finalForm);
        setCalculation(calcResult);

      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleEditPersonalOrIncome = () => {
    router.push("/service/tds-form");
  };

  const handleEditDocuments = () => {
    router.push("/service/tds-checklist");
  };

  const handleProceedToPayment = async () => {
    if (!calculation) return;
    setIsSubmitting(true);

    try {
      const existingAppId = await tdsDraftService.getApplicationId();
      const response = await tdsApiService.submitApplicationDraft(
        formData,
        documents as any,
        calculation,
        existingAppId || undefined
      );

      const targetAppId = response?.applicationId || existingAppId;
      if (!targetAppId) {
        throw new Error("Unable to create application record on server. Please try again.");
      }

      await tdsDraftService.saveApplicationId(targetAppId);
      useApplicationStore.getState().saveTdsDraft({ step: "PAYMENT" });

      router.push({
        pathname: "/service/tds-payment",
        params: {
          applicationId: targetAppId,
          refundAmount: calculation.estimatedRefund.toString(),
          isAdditionalPayable: calculation.isAdditionalTaxPayable ? "1" : "0",
          payableAmount: calculation.estimatedTaxPayable.toString(),
          serviceFee: calculation.serviceFee.toString(),
          gstAmount: calculation.gstAmount.toString(),
          totalPayable: calculation.totalPayableFee.toString(),
        },
      });
    } catch (err) {
      Alert.alert(
        "Application Submission Failed",
        getErrorMessage(err) || "Failed to submit application to the server. Please check your network and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadedDocs = documents.filter((d) => (d.status === "uploaded" || d.status === "verified") || !!d.fileUri || !!d.fileName);

  const maskAccount = (num: string) => {
    if (!num || num.length < 4) return "••••";
    return `••••${num.slice(-4)}`;
  };

  return (
    <View style={styles.container}>
      <FocusAwareStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Header */}
      <View style={[styles.headerBar, { paddingTop: Math.max(insets.top, 12) + 6 }]}>
        <View style={{ width: 38, height: 38 }} />

        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerTitle}>Review Application</Text>
          <Text style={styles.headerSubtitle}>Step 3 of 5: Review & Estimate</Text>
        </View>

                <TouchableOpacity
          activeOpacity={0.7}
          onPress={openDraftModal}
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: "#F8FAFC",
            borderWidth: 1,
            borderColor: "#E2E8F0",
            justifyContent: "center",
            alignItems: "center",
          }}
          accessibilityLabel="Save Draft"
        >
          <Ionicons name="save-outline" size={20} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* Progress Track */}
      <View style={styles.progressTrack}>
        <View style={styles.progressFill} />
      </View>

      {/* Main Scroll Content */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 85 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ========================================================
            SECTION 1: PERSONAL DETAILS
        ======================================================== */}
        <ReviewSectionCard
          icon="person-outline"
          title="Personal Details"
          onEdit={handleEditPersonalOrIncome}
        >
          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Full Name</Text>
              <Text style={styles.infoValue}>{formData.personal.fullName || "—"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>PAN</Text>
              <Text style={styles.infoValue}>{formData.personal.pan || "—"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mobile Number</Text>
              <Text style={styles.infoValue}>+91 {formData.personal.mobileNumber || "—"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{formData.personal.email || "—"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                {formData.personal.city}, {formData.personal.state} - {formData.personal.pinCode}
              </Text>
            </View>
          </View>
        </ReviewSectionCard>

        {/* ========================================================
            SECTION 2: INCOME DETAILS
        ======================================================== */}
        <ReviewSectionCard
          icon="trending-up-outline"
          title="Income Details"
          onEdit={handleEditPersonalOrIncome}
        >
          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tax Regime</Text>
              <Text style={styles.infoValue}>
                {formData.income.taxRegime === "OLD" ? "Old Regime" : "New Regime"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Gross Salary</Text>
              <Text style={styles.infoValue}>
                {formatCurrency(parseFloat(formData.income.salaryIncome) || 0)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Other & Interest Income</Text>
              <Text style={styles.infoValue}>
                {formatCurrency(
                  (parseFloat(formData.income.otherIncome) || 0) +
                    (parseFloat(formData.income.interestIncome) || 0)
                )}
              </Text>
            </View>
            {formData.income.hasRentalIncome && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Rental Income</Text>
                <Text style={styles.infoValue}>
                  {formatCurrency(parseFloat(formData.income.rentalIncome) || 0)}
                </Text>
              </View>
            )}
            {formData.income.hasBusinessIncome && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Business Profit</Text>
                <Text style={styles.infoValue}>
                  {formatCurrency(parseFloat(formData.income.netBusinessProfit) || 0)}
                </Text>
              </View>
            )}
          </View>
        </ReviewSectionCard>

        {/* ========================================================
            SECTION 3: TDS DETAILS
        ======================================================== */}
        <ReviewSectionCard
          icon="receipt-outline"
          title="TDS Details"
          onEdit={handleEditPersonalOrIncome}
        >
          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total TDS Deducted</Text>
              <Text style={styles.infoValue}>
                {formatCurrency(parseFloat(formData.income.totalTdsDeducted) || 0)}
              </Text>
            </View>
            {parseFloat(formData.income.tcsAmount) > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>TCS Amount</Text>
                <Text style={styles.infoValue}>
                  {formatCurrency(parseFloat(formData.income.tcsAmount) || 0)}
                </Text>
              </View>
            )}
            {parseFloat(formData.income.advanceTaxPaid) > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Advance Tax</Text>
                <Text style={styles.infoValue}>
                  {formatCurrency(parseFloat(formData.income.advanceTaxPaid) || 0)}
                </Text>
              </View>
            )}
            {parseFloat(formData.income.selfAssessmentTaxPaid) > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Self Assessment Tax</Text>
                <Text style={styles.infoValue}>
                  {formatCurrency(parseFloat(formData.income.selfAssessmentTaxPaid) || 0)}
                </Text>
              </View>
            )}
          </View>
        </ReviewSectionCard>

        {/* ========================================================
            SECTION 4: DEDUCTIONS
        ======================================================== */}
        <ReviewSectionCard
          icon="wallet-outline"
          title="Deductions"
          onEdit={handleEditPersonalOrIncome}
        >
          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Section 80C</Text>
              <Text style={styles.infoValue}>
                {formatCurrency(parseFloat(formData.income.deductions80C) || 0)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Section 80D</Text>
              <Text style={styles.infoValue}>
                {formatCurrency(parseFloat(formData.income.deductions80D) || 0)}
              </Text>
            </View>
            {parseFloat(formData.income.donations80G) > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>80G Donations</Text>
                <Text style={styles.infoValue}>
                  {formatCurrency(parseFloat(formData.income.donations80G) || 0)}
                </Text>
              </View>
            )}
            {formData.income.hasHomeLoan && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Home Loan Interest</Text>
                <Text style={styles.infoValue}>
                  {formatCurrency(parseFloat(formData.income.homeLoanInterestSec24b) || 0)}
                </Text>
              </View>
            )}
          </View>
        </ReviewSectionCard>

        {/* ========================================================
            SECTION 5: BANK DETAILS
        ======================================================== */}
        <ReviewSectionCard
          icon="business-outline"
          title="Bank Details"
          onEdit={handleEditPersonalOrIncome}
        >
          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Bank Name</Text>
              <Text style={styles.infoValue}>{formData.bank.bankName || "—"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Branch</Text>
              <Text style={styles.infoValue}>{formData.bank.branchName || "—"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Account Number</Text>
              <Text style={styles.infoValue}>
                {maskAccount(formData.bank.accountNumber)} ({formData.bank.accountType})
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>IFSC Code</Text>
              <Text style={styles.infoValue}>{formData.bank.ifscCode || "—"}</Text>
            </View>
          </View>
        </ReviewSectionCard>

        {/* ========================================================
            SECTION 6: DOCUMENTS
        ======================================================== */}
        <ReviewSectionCard
          icon="document-attach-outline"
          title={`Documents (${uploadedDocs.length})`}
          onEdit={handleEditDocuments}
        >
          <View style={styles.docPillList}>
            {uploadedDocs.length > 0 ? (
              uploadedDocs.map((doc) => (
                <View key={doc.id} style={styles.docPill}>
                  <Ionicons name="checkmark-circle" size={13} color="#16A34A" />
                  <Text style={styles.docPillText}>{doc.title}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.infoLabel}>No documents uploaded yet</Text>
            )}
          </View>
        </ReviewSectionCard>

        {/* ========================================================
            SECTION 7: TAX CALCULATION
        ======================================================== */}
        {calculation && <TaxCalculationBreakdownCard breakdown={calculation} />}
      </ScrollView>

      {/* Sticky Bottom CTA */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom > 0 ? insets.bottom : 12 }]}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleProceedToPayment}
          disabled={isSubmitting}
          style={styles.proceedButton}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={BrandColors.WHITE} />
          ) : (
            <>
              <Text style={styles.proceedButtonText}>Proceed to Payment</Text>
              <Ionicons name="arrow-forward" size={18} color={BrandColors.WHITE} />
            </>
          )}
        </TouchableOpacity>
      </View>
      <UniversalDraftModal
        visible={showDraftModal}
        onSaveAndExit={handleSaveAndExit}
        onDiscard={handleDiscardAndExit}
        onKeepEditing={handleCancel}
      />
    </View>
  );
};

export default TdsRefundEstimateScreen;



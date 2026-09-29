import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
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
import { tdsDraftService, INITIAL_TDS_FORM_DATA, getTdsCustId } from "../../services/tdsDraftService";
import { tdsCalculationService } from "../../services/tdsCalculationService";
import { tdsApiService } from "../../services/tdsApiService";
import { TaxCalculationBreakdownCard } from "../../components/estimate/TaxCalculationBreakdownCard";
import { styles } from "./TdsRefundEstimateScreen.styles";

export const TdsRefundEstimateScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [formData, setFormData] = useState<TdsCustomerIncomeFormData>(INITIAL_TDS_FORM_DATA);
  const [documents, setDocuments] = useState<TdsChecklistItem[]>([]);
  const [calculation, setCalculation] = useState<TaxCalculationBreakdown | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const savedForm = await tdsDraftService.getFormDraft();
      const savedDocs = await tdsDraftService.getDocumentsDraft();
      const existingAppId = await tdsDraftService.getApplicationId();

      const custId = getTdsCustId(savedForm.personal?.mobileNumber);

      let finalForm = savedForm;
      let finalDocs = savedDocs || [];

      try {
        const backendApp = custId
          ? await tdsApiService.fetchFullTdsApplication(custId, existingAppId || undefined)
          : null;
        if (backendApp) {
          if (backendApp.bank) finalForm.bank = { ...finalForm.bank, ...backendApp.bank };
          if (backendApp.income) finalForm.income = { ...finalForm.income, ...backendApp.income };
          if (backendApp.documents && backendApp.documents.length > 0) {
            finalDocs = backendApp.documents as any;
          }
        }
      } catch (err) {
        console.warn("[TDS Estimate Screen] Backend fetch warning:", err);
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
    router.push("/service/tds-form" as any);
  };

  const handleEditDocuments = () => {
    router.push("/service/tds-checklist" as any);
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
        pathname: "/service/tds-payment" as any,
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
    } catch (err: any) {
      Alert.alert(
        "Application Submission Failed",
        err?.message || "Failed to submit application to the server. Please check your network and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadedDocs = documents.filter((d) => d.status === "uploaded" && d.fileUri);

  const maskAccount = (num: string) => {
    if (!num || num.length < 4) return "••••";
    return `••••${num.slice(-4)}`;
  };

  return (
    <View style={styles.container}>
      <FocusAwareStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Header */}
      <View style={[styles.headerBar, { paddingTop: Math.max(insets.top, 12) + 6 }]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={20} color={BrandColors.PRIMARY_BLUE_DARK} />
        </TouchableOpacity>

        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerTitle}>Review Application</Text>
          <Text style={styles.headerSubtitle}>Step 3 of 5: Review & Estimate</Text>
        </View>

        <View style={styles.headerRightSpacer} />
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
        <View style={styles.reviewCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardTitleGroup}>
              <Ionicons name="person-outline" size={18} color={BrandColors.PRIMARY_BLUE} />
              <Text style={styles.cardTitle}>Personal Details</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleEditPersonalOrIncome}
              style={styles.editButton}
            >
              <Ionicons name="pencil" size={12} color={BrandColors.PRIMARY_ORANGE_DARK} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

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
        </View>

        {/* ========================================================
            SECTION 2: INCOME DETAILS
        ======================================================== */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardTitleGroup}>
              <Ionicons name="trending-up-outline" size={18} color={BrandColors.PRIMARY_BLUE} />
              <Text style={styles.cardTitle}>Income Details</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleEditPersonalOrIncome}
              style={styles.editButton}
            >
              <Ionicons name="pencil" size={12} color={BrandColors.PRIMARY_ORANGE_DARK} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

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
        </View>

        {/* ========================================================
            SECTION 3: TDS DETAILS
        ======================================================== */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardTitleGroup}>
              <Ionicons name="receipt-outline" size={18} color={BrandColors.PRIMARY_BLUE} />
              <Text style={styles.cardTitle}>TDS Details</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleEditPersonalOrIncome}
              style={styles.editButton}
            >
              <Ionicons name="pencil" size={12} color={BrandColors.PRIMARY_ORANGE_DARK} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

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
        </View>

        {/* ========================================================
            SECTION 4: DEDUCTIONS
        ======================================================== */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardTitleGroup}>
              <Ionicons name="wallet-outline" size={18} color={BrandColors.PRIMARY_BLUE} />
              <Text style={styles.cardTitle}>Deductions</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleEditPersonalOrIncome}
              style={styles.editButton}
            >
              <Ionicons name="pencil" size={12} color={BrandColors.PRIMARY_ORANGE_DARK} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

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
        </View>

        {/* ========================================================
            SECTION 5: BANK DETAILS
        ======================================================== */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardTitleGroup}>
              <Ionicons name="business-outline" size={18} color={BrandColors.PRIMARY_BLUE} />
              <Text style={styles.cardTitle}>Bank Details</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleEditPersonalOrIncome}
              style={styles.editButton}
            >
              <Ionicons name="pencil" size={12} color={BrandColors.PRIMARY_ORANGE_DARK} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

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
        </View>

        {/* ========================================================
            SECTION 6: DOCUMENTS
        ======================================================== */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardTitleGroup}>
              <Ionicons name="document-attach-outline" size={18} color={BrandColors.PRIMARY_BLUE} />
              <Text style={styles.cardTitle}>
                Documents ({uploadedDocs.length})
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleEditDocuments}
              style={styles.editButton}
            >
              <Ionicons name="pencil" size={12} color={BrandColors.PRIMARY_ORANGE_DARK} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

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
        </View>

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
    </View>
  );
};

export default TdsRefundEstimateScreen;

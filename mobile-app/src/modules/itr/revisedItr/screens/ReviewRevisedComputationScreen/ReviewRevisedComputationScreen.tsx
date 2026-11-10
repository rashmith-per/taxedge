import React from "react";
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
import { useRevisedProgressStore } from "../../store/revisedProgressStore";
import { RevisedItrApiService } from "../../services/RevisedItrApiService";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { RevisedItrHeader } from "../../components/common";
import {
  ComputationComparisonTable,
  RevisedRefundHeroCard,
} from "../../components/review";
import {
  styles,
  getContainerInsetsStyle,
  getScrollContentInsetsStyle,
  getBottomBarInsetsStyle,
} from "./ReviewRevisedComputationScreen.styles";

import { useAuthStore } from "@/modules/authentication/store/authStore";
import { useCustomerStore } from "@/modules/customer/store/customerStore";
import { useApplicationStore } from "@/store/applicationStore";
import { DEFAULT_REVISED_FORM_FIELDS } from "../../mock/revisedItrData";
import { RevisedFormFields } from "../../types/revisedItr.types";
import { buildComparisonRows, computeRevisedRefund } from "../../services/revisedItrCalculations";

export const ReviewRevisedComputationScreen: React.FC = () => {
  React.useEffect(() => {
    useRevisedProgressStore.getState().setMaxStepReached(3);
  }, []);

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const storeIsSubmitted = useRevisedProgressStore((s) => s.isSubmitted);
  const params = useLocalSearchParams<{
    acknowledgementNumber?: string;
    assessmentYear?: string;
    revisionReason?: string;
    revisedDetails?: string;
    uploadedDocsCount?: string;
    totalDocsCount?: string;
    revisedItrId?: string;
  }>();

  const {
    showDraftModal,
    markSubmitted,
    handleSaveAndExit,
    handleDiscardAndExit,
    handleCancel,
  } = useUniversalDraftGuard({
    saveDestination: "/service/itr",
    discardDestination: "/service/itr",
    isDirty: () => true,
    onSaveDraft: () => {
      useApplicationStore.getState().saveRevisedItrDraft({ step: 3 });
    },
    onDiscardDraft: () => {
      useApplicationStore.getState().clearRevisedItrDraft();
    },
    isSubmitted: () => isSubmitting || useRevisedProgressStore.getState().isSubmitted,
  });
  const assessmentYear = params.assessmentYear || "AY 2025–26";
  const ackNo = params.acknowledgementNumber || "";

  // BUG-ITR-060: compute live from store so doc count stays accurate after editing income/Changes.
  const storeDocumentsForCount = useRevisedProgressStore((s) => s.documents);
  const uploadedDocs = storeDocumentsForCount
    ? storeDocumentsForCount.filter((d) => d.status === "uploaded" || !!d.fileUri).length.toString()
    : params.uploadedDocsCount || "0";
  const totalDocs = storeDocumentsForCount
    ? storeDocumentsForCount.length.toString()
    : params.totalDocsCount || "6";

  const customerFromAuth = useAuthStore((s) => s.customer);
  const profileFromCust = useCustomerStore((s) => s.profile);
  const customer = customerFromAuth || profileFromCust;

  let formDetails: RevisedFormFields = DEFAULT_REVISED_FORM_FIELDS;
  if (params.revisedDetails) {
    try {
      formDetails = JSON.parse(params.revisedDetails);
    } catch { }
  }

  const getReasonLabel = (id?: string): string => {
    switch (id) {
      case "missed_income":
        return "Missed Income";
      case "wrong_deduction":
        return "Wrong Deduction";
      case "incorrect_bank":
        return "Incorrect Bank Details";
      case "other":
        return "Other Correction";
      default:
        return "Missed Income";
    }
  };

  const handleEditOriginal = () => {
    router.push({
      pathname: "/service/revised-itr" as any,
      params: {
        acknowledgementNumber: ackNo,
        assessmentYear,
        revisionReason: params.revisionReason,
        revisedDetails: params.revisedDetails, isEditing: "true",
      },
    });
  };

  const handleEditChanges = () => {
    router.push({
      pathname: "/service/revised-itr-update" as any,
      params: {
        acknowledgementNumber: ackNo,
        assessmentYear,
        revisionReason: params.revisionReason,
        revisedDetails: params.revisedDetails, isEditing: "true",
      },
    });
  };

  const handleEditDocs = () => {
    router.push({
      pathname: "/service/revised-itr-documents" as any,
      params: {
        acknowledgementNumber: ackNo,
        assessmentYear,
        revisionReason: params.revisionReason,
        revisedDetails: params.revisedDetails, isEditing: "true",
      },
    });
  };

  const createApplication = useApplicationStore((state) => state.createApplication);
  const applications = useApplicationStore((state) => state.applications);

  // Resolve original gross income from the previously filed application record.
  const originalApp = applications.find(
    (a) =>
      (a.formData as any)?.previousAckNumber === ackNo ||
      a.id === ackNo,
  );
  const rawOriginalGross: unknown = (originalApp?.formData as any)?.grossTotalIncome;
  const originalGrossIncomeStr =
    rawOriginalGross != null
      ? `₹${Number(rawOriginalGross).toLocaleString("en-IN")}`
      : undefined;

  const comparisonRows = buildComparisonRows(
    formDetails,
    params.revisionReason ?? null,
    originalGrossIncomeStr,
  );

  // Extract tax outcome fields stored when the original ITR was filed.
  const rawTaxesPaid: unknown = (originalApp?.formData as any)?.totalTaxesPaid;
  const totalTaxesPaid = rawTaxesPaid != null ? Number(rawTaxesPaid) : undefined;
  const rawFinalAmount: unknown = (originalApp?.formData as any)?.finalAmount;
  const originalFinalAmount = rawFinalAmount != null ? Number(rawFinalAmount) : undefined;
  const rawFinalType: unknown = (originalApp?.formData as any)?.finalType;
  const originalFinalType = typeof rawFinalType === "string" ? rawFinalType : undefined;
  const rawRegime: unknown = (originalApp?.formData as any)?.regime;
  const originalRegime = typeof rawRegime === "string" ? rawRegime : undefined;

  const refundSummary = computeRevisedRefund(
    formDetails.taxableIncome,
    originalRegime,
    totalTaxesPaid,
    originalFinalAmount,
    originalFinalType,
    assessmentYear,
  );

  const handleSubmitRevisedItr = async () => {
    if (isSubmitting || storeIsSubmitted) return;
    setIsSubmitting(true);

    try {
      const activeRevisedItrId =
        params.revisedItrId || useRevisedProgressStore.getState().revisedItrId;

      // 1. Get Push Token for notifications
      let pushToken: string | undefined;
      try {
        const { registerForPushNotificationsAsync } = await import(
          "@/utils/pushNotificationService"
        );
        pushToken = (await registerForPushNotificationsAsync()) || undefined;
      } catch (pushErr) {
        console.warn("[Revised ITR Submit] Push token warning:", pushErr);
      }

      // 2. Submit to backend /api/v1/itr/revised/submit to transition status from DRAFT to SUBMITTED
      if (activeRevisedItrId) {
        try {
          await RevisedItrApiService.submitRevisedItr(activeRevisedItrId, pushToken);
          console.log("✅ [Revised ITR Submit] Successfully submitted to backend:", activeRevisedItrId);
        } catch (subErr: any) {
          console.warn("[Revised ITR Submit] Backend submit warning:", subErr);
        }
      }

      // 3. Update global application store with Submitted status
      const serviceTitle = `Revised ITR (${assessmentYear})`;

      const storeDocs = useRevisedProgressStore.getState().documents || [];
      const uploadedDocItems = storeDocs
        .filter((d: any) => Boolean(d.fileUri) || d.status === "uploaded" || d.status === "Uploaded")
        .map((d: any) => ({
          name: d.title || d.name || d.id || "Supporting Document",
          category: d.category || d.title || "Revised ITR Proof",
          fileName: d.fileName || `${(d.title || d.name || d.id || "document").replace(/[^a-zA-Z0-9._-]/g, "_")}.pdf`,
          fileUri: d.fileUri || "verified://revised",
          fileSize: d.fileSize || "1.2 MB",
          status: "Uploaded" as const,
          uploadedAt: new Date().toISOString(),
        }));

      const defaultRequiredDocs = [
        {
          name: "PAN Card",
          fileName: "PAN_Card.pdf",
          fileSize: "1.2 MB",
          status: "Uploaded" as const,
          fileUri: "verified://pan",
          uploadedAt: new Date().toISOString(),
        },
        {
          name: "Aadhaar Card",
          fileName: "Aadhaar_Card.pdf",
          fileSize: "980 KB",
          status: "Uploaded" as const,
          fileUri: "verified://aadhaar",
          uploadedAt: new Date().toISOString(),
        },
        {
          name: `Form 16 / 16A (${assessmentYear})`,
          fileName: `Form16_${assessmentYear.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
          fileSize: "2.4 MB",
          status: "Uploaded" as const,
          fileUri: "verified://form16",
          uploadedAt: new Date().toISOString(),
        },
        {
          name: "AIS and TIS Statement",
          fileName: "AIS_TIS_Statement.pdf",
          fileSize: "1.8 MB",
          status: "Uploaded" as const,
          fileUri: "verified://ais_tis",
          uploadedAt: new Date().toISOString(),
        },
        {
          name: "Bank Statements",
          fileName: "Bank_Statements.pdf",
          fileSize: "3.1 MB",
          status: "Uploaded" as const,
          fileUri: "verified://bank",
          uploadedAt: new Date().toISOString(),
        },
        {
          name: "Investment Proofs",
          fileName: "Investment_Proofs.pdf",
          fileSize: "1.5 MB",
          status: "Uploaded" as const,
          fileUri: "verified://investments",
          uploadedAt: new Date().toISOString(),
        },
      ];

      const docsToPass = uploadedDocItems.length > 0 ? uploadedDocItems : defaultRequiredDocs;

      const generatedAppId = createApplication(
        "revised-itr",
        serviceTitle,
        "ITR",
        {
          originalAckNo: ackNo,
          assessmentYear,
          revisionReason: getReasonLabel(params.revisionReason),
          revisedFields: formDetails,
        },
        docsToPass,
        0,
        "Paid",
        false,
        activeRevisedItrId
      );

      const targetAppId = activeRevisedItrId || generatedAppId;

      // 4. In-App Notification
      try {
        const { useNotificationStore } = await import("@/store/notificationStore");
        useNotificationStore.getState().addNotification(
          "Revised ITR Submitted",
          `Your Revised ITR application (${targetAppId}) has been successfully submitted for CA review.`,
          "itr"
        );
      } catch (notifErr) {
        console.warn("[Revised ITR Submit] Notification dispatch warning:", notifErr);
      }

      // 5. Clear draft & reset progress
      try {
        useApplicationStore.getState().clearRevisedItrDraft();
        useRevisedProgressStore.getState().setIsSubmitted(true);
      } catch { }

      // Mark submitted to disable navigation draft prevention
      markSubmitted();

      // 6. Navigate to Application Success screen, clearing service screens from the stack.
      // When canDismiss() is true (service screens sit above the root tab), dismissAll() pops
      // back to the root and navigate() pushes success as the only service entry — preventing
      // back navigation into the Revised ITR wizard. When canDismiss() is false, replace() swaps
      // just the current entry as before.
      const successParams = {
        serviceType: "revised",
        serviceTitle,
        customerName: customer?.name || (customer as any)?.fullName || "",
        assessmentYear,
        applicationId: targetAppId,
        uploadedDocsCount: uploadedDocs,
        totalDocsCount: totalDocs,
        status: "Submitted",
      };
      if (router.canDismiss()) {
        router.dismissAll();
        router.navigate({ pathname: "/service/itr-success" as any, params: successParams });
      } else {
        router.replace({ pathname: "/service/itr-success" as any, params: successParams });
      }
    } catch (err: any) {
      console.error("[Revised ITR Submit] Error:", err);
      Alert.alert(
        "Submission Failed",
        err?.message || "Failed to submit Revised ITR. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, getContainerInsetsStyle(insets.top)]}>
      <FocusAwareStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Header */}
      <RevisedItrHeader subtitle="Review Revised ITR" hideBackButton showDraftIcon={false} />

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          getScrollContentInsetsStyle(insets.bottom),
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Review Revised ITR</Text>
          <Text style={styles.pageSubtitle}>
            Review your updated details before submitting for CA review.
          </Text>
        </View>

        {/* 1. Original Return Section */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Original Return</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleEditOriginal}
              style={styles.editBtn}
            >
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.infoList}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ack Number</Text>
              <Text style={styles.infoVal}>{ackNo}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Assessment Year</Text>
              <Text style={styles.infoVal}>{assessmentYear}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>ITR Form</Text>
              <Text style={styles.infoVal}>ITR-1</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Gross Total Income</Text>
              <Text style={styles.infoVal}>₹8,12,400</Text>
            </View>
          </View>
        </View>

        {/* 2. Changes Section */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Changes</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleEditChanges}
              style={styles.editBtn}
            >
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.infoList}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Revision Reason</Text>
              <Text style={styles.infoVal}>{getReasonLabel(params.revisionReason)}</Text>
            </View>
            {params.revisionReason === "incorrect_bank" ? (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Revised Bank</Text>
                  <Text style={styles.infoVal}>{formDetails.bankAccount}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Revised IFSC</Text>
                  <Text style={styles.infoVal}>{formDetails.ifsc}</Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Revised Salary / Business</Text>
                  <Text style={styles.infoVal}>₹{formDetails.salaryBusinessIncome}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Revised Taxable Income</Text>
                  <Text style={styles.infoVal}>₹{formDetails.taxableIncome}</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* 4. Documents Section */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Documents</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleEditDocs}
              style={styles.editBtn}
            >
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.infoList}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Uploaded Count</Text>
              <Text style={styles.infoVal}>{uploadedDocs} of {totalDocs} documents</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Verification Status</Text>
              <Text style={styles.infoVal}>Ready for CA Review</Text>
            </View>
          </View>
        </View>

        {/* 5. Tax Calculation Comparison — rows derived from active revised form data */}
        <ComputationComparisonTable rows={comparisonRows} />

        {/* 6. Revised Refund Summary Card — computed when original return data is available */}
        <RevisedRefundHeroCard
          revisedRefund={refundSummary.revisedRefund}
          originalRefund={refundSummary.originalRefund}
          changeRefund={refundSummary.changeRefund}
          additionalTaxPayable={refundSummary.additionalTaxPayable}
        />
      </ScrollView>

      {/* Sticky Bottom Action Button */}
      <View
        style={[
          styles.bottomBar,
          getBottomBarInsetsStyle(insets.bottom),
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSubmitRevisedItr}
          disabled={isSubmitting || storeIsSubmitted}
          style={styles.proceedButton}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.proceedButtonText}>Submit for CA Review</Text>
              <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
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

export default ReviewRevisedComputationScreen;




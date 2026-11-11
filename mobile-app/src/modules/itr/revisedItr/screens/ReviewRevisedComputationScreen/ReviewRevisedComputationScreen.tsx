import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { useRevisedProgressStore } from "../../store/revisedProgressStore";
import { RevisedItrApiService } from "../../services/RevisedItrApiService";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { RevisedItrHeader } from "../../components/common";
import { formatIndianAmount } from "@/shared/formatters/currencyFormatter";
import {
  styles,
  getContainerInsetsStyle,
  getScrollContentInsetsStyle,
} from "./ReviewRevisedComputationScreen.styles";

import { useAuthStore } from "@/modules/authentication/store/authStore";
import { useCustomerStore } from "@/modules/customer/store/customerStore";
import { useApplicationStore } from "@/store/applicationStore";
import { DEFAULT_REVISED_FORM_FIELDS } from "../../mock/revisedItrData";
import { RevisedFormFields } from "../../types/revisedItr.types";
import { BrandColors } from "@/shared/theme";
import { GstViewDocumentModal } from "@/modules/gst/components/GstDocumentCard";
import { UniversalDraftModal } from "@/shared/components/UniversalDraftModal";
import { useRevisedItrDraft } from "../../hooks/useRevisedItrDraft";

export const ReviewRevisedComputationScreen: React.FC = () => {
  React.useEffect(() => {
    useRevisedProgressStore.getState().setMaxStepReached(3);
  }, []);

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedPreviewDoc, setSelectedPreviewDoc] = React.useState<{
    title?: string;
    fileUri?: string;
    fileName?: string;
    fileSize?: string;
    fileTypeLabel?: string;
    mimeType?: string;
  } | null>(null);
  const storeIsSubmitted = useRevisedProgressStore((s) => s.isSubmitted);
  const params = useLocalSearchParams<{
    acknowledgementNumber?: string;
    assessmentYear?: string;
    revisionReason?: string;
    otherReasonText?: string;
    revisedDetails?: string;
    uploadedDocsCount?: string;
    totalDocsCount?: string;
    revisedItrId?: string;
  }>();

  const assessmentYear = params.assessmentYear || "AY 2026-27";
  const ackNo = params.acknowledgementNumber || "";

  const draftGuard = useRevisedItrDraft({
    step: 5,
    acknowledgementNumber: ackNo,
    assessmentYear,
  });

  // Compute live from store so doc count stays accurate after editing income/Changes
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
        otherReasonText: params.otherReasonText,
        revisedDetails: params.revisedDetails,
        isEditing: "true",
      },
    });
  };

  const handleEditReason = () => {
    router.push({
      pathname: "/service/revised-itr-reason" as any,
      params: {
        acknowledgementNumber: ackNo,
        assessmentYear,
        revisionReason: params.revisionReason,
        otherReasonText: params.otherReasonText,
        revisedDetails: params.revisedDetails,
        isEditing: "true",
        fromReview: "true",
      },
    });
  };

  const handleEditRevisedDetails = () => {
    router.push({
      pathname: "/service/revised-itr-update" as any,
      params: {
        acknowledgementNumber: ackNo,
        assessmentYear,
        revisionReason: params.revisionReason,
        otherReasonText: params.otherReasonText,
        revisedDetails: params.revisedDetails,
        isEditing: "true",
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
        otherReasonText: params.otherReasonText,
        revisedDetails: params.revisedDetails,
        isEditing: "true",
      },
    });
  };

  const createApplication = useApplicationStore((state) => state.createApplication);

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

      // 5. Update submission state & clear drafts
      try {
        draftGuard.markSubmitted();
        draftGuard.clearRevisedItrDraft();
        useRevisedProgressStore.getState().setIsSubmitted(true);
      } catch { }

      // 6. Navigate to Application Success screen
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

  const formatAmount = (val?: string): string => {
    if (!val || !val.trim()) return "—";
    return `₹${formatIndianAmount(val)}`;
  };

  return (
    <View style={[styles.container, getContainerInsetsStyle(insets.top)]}>
      <FocusAwareStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Header with Step Indicator */}
      <RevisedItrHeader
        subtitle="Review & Submit"
        currentStep={5}
        totalSteps={5}
        hideBackButton
      />

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
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Acknowledgement Number</Text>
            <Text style={styles.infoVal}>{ackNo || "—"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Assessment Year</Text>
            <Text style={styles.infoVal}>{assessmentYear}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ITR Form</Text>
            <Text style={styles.infoVal}>ITR-1</Text>
          </View>
        </View>

        {/* 2. Reason for Revision Card */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Reason for Revision</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleEditReason}
              style={styles.editBtn}
            >
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Selected Reason</Text>
            <Text style={styles.infoVal}>{getReasonLabel(params.revisionReason)}</Text>
          </View>
          {params.otherReasonText ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Reason Details</Text>
              <Text style={styles.infoVal}>{params.otherReasonText}</Text>
            </View>
          ) : null}
        </View>

        {/* 3. Revised Return Details Card */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Revised Return Details</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleEditRevisedDetails}
              style={styles.editBtn}
            >
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* Income Fields (for missed_income or other) */}
          {(params.revisionReason === "missed_income" || params.revisionReason === "other" || !params.revisionReason) && (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Revised Salary / Business</Text>
                <Text style={styles.infoVal}>{formatAmount(formDetails.salaryBusinessIncome)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Revised Other Income</Text>
                <Text style={styles.infoVal}>{formatAmount(formDetails.otherIncome)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Revised Taxable Income</Text>
                <Text style={styles.infoVal}>{formatAmount(formDetails.taxableIncome)}</Text>
              </View>
            </>
          )}

          {/* Deduction Fields (for wrong_deduction or other) */}
          {(params.revisionReason === "wrong_deduction" || params.revisionReason === "other") && (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Revised 80C Deduction</Text>
                <Text style={styles.infoVal}>{formatAmount(formDetails.sec80c)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Revised 80D Deduction</Text>
                <Text style={styles.infoVal}>{formatAmount(formDetails.sec80d)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Revised Home Loan Interest</Text>
                <Text style={styles.infoVal}>{formatAmount(formDetails.homeLoanInterest)}</Text>
              </View>
              {params.revisionReason === "wrong_deduction" && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Revised Taxable Income</Text>
                  <Text style={styles.infoVal}>{formatAmount(formDetails.taxableIncome)}</Text>
                </View>
              )}
            </>
          )}

          {/* Bank Details (for incorrect_bank or other) */}
          {(params.revisionReason === "incorrect_bank" || params.revisionReason === "other") && (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Revised Bank</Text>
                <Text style={styles.infoVal}>{formDetails.bankAccount || "—"}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Revised IFSC Code</Text>
                <Text style={styles.infoVal}>{formDetails.ifsc || "—"}</Text>
              </View>
            </>
          )}
        </View>

        {/* 4. Uploaded Documents Section — UI matching GST Registration Review (Image 2) */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Uploaded Documents</Text>
            <TouchableOpacity
              style={styles.editDocsButton}
              onPress={handleEditDocs}
              accessibilityLabel="Edit Uploaded Documents"
              activeOpacity={0.7}
            >
              <Ionicons name="pencil" size={16} color={BrandColors.PRIMARY_ORANGE} />
              <Text style={styles.editDocsButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {storeDocumentsForCount && storeDocumentsForCount.filter((d) => d.status === "uploaded" || !!d.fileUri).length > 0 ? (
            <View style={styles.uploadedDocList}>
              {storeDocumentsForCount
                .filter((d) => d.status === "uploaded" || !!d.fileUri)
                .map((doc) => (
                  <TouchableOpacity
                    key={doc.id}
                    style={styles.uploadedDocItem}
                    activeOpacity={0.7}
                    onPress={() => setSelectedPreviewDoc({
                      title: doc.title?.replace("\n", " "),
                      fileUri: doc.fileUri,
                      fileName: doc.fileName,
                      fileSize: doc.fileSize,
                      mimeType: doc.mimeType,
                    })}
                  >
                    <Ionicons name="checkmark-circle" size={18} color="#059669" />
                    <View style={styles.uploadedDocTextCol}>
                      <Text style={styles.uploadedDocName} numberOfLines={1}>
                        {doc.title?.replace("\n", " ")}
                      </Text>
                      {doc.fileName ? (
                        <Text style={styles.uploadedDocSubtitle} numberOfLines={1}>
                          {doc.fileName} {doc.fileSize ? `• ${doc.fileSize}` : ""}
                        </Text>
                      ) : null}
                    </View>
                    <TouchableOpacity
                      style={styles.eyeIconBox}
                      activeOpacity={0.7}
                      onPress={(e) => {
                        e?.stopPropagation?.();
                        setSelectedPreviewDoc({
                          title: doc.title?.replace("\n", " "),
                          fileUri: doc.fileUri,
                          fileName: doc.fileName,
                          fileSize: doc.fileSize,
                          mimeType: doc.mimeType,
                        });
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`Preview ${doc.title}`}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons
                        name="eye-outline"
                        size={18}
                        color={BrandColors.PRIMARY_BLUE}
                      />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
            </View>
          ) : (
            <Text style={styles.emptyDocsText}>No documents uploaded yet</Text>
          )}
        </View>

        {/* Action Button — In Scroll Flow (Matching GST Filing) */}
        <View style={styles.buttonWrapper}>
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
      </ScrollView>

      {/* Document Preview Modal */}
      {selectedPreviewDoc && (
        <GstViewDocumentModal
          visible={Boolean(selectedPreviewDoc)}
          title={selectedPreviewDoc.title || "Document Preview"}
          fileUri={selectedPreviewDoc.fileUri}
          fileName={selectedPreviewDoc.fileName}
          fileSize={selectedPreviewDoc.fileSize}
          fileTypeLabel={selectedPreviewDoc.fileTypeLabel}
          mimeType={selectedPreviewDoc.mimeType}
          onClose={() => setSelectedPreviewDoc(null)}
        />
      )}

      {/* Universal Draft Modal */}
      <UniversalDraftModal
        visible={draftGuard.showDraftModal}
        onSaveAndExit={draftGuard.handleSaveAndExit}
        onDiscardAndExit={draftGuard.handleDiscardAndExit}
        onCancel={draftGuard.handleKeepEditing}
      />
    </View>
  );
};

export default ReviewRevisedComputationScreen;

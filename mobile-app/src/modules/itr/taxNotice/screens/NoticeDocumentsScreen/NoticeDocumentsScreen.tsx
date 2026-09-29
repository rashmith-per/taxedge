import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { TaxNoticeHeader } from "../../components/common";
import { NoticeDocUploadCard } from "../../components/documents";
import { INITIAL_TAX_NOTICE_DOCUMENTS } from "../../mock/taxNoticeData";
import { TaxNoticeSupportingDoc } from "../../types/taxNotice.types";
import { useApplicationStore } from "@/store/applicationStore";
import { UniversalDraftModal } from "@/shared/components/UniversalDraftModal";
import { useUniversalDraftGuard } from "@/shared/hooks/useUniversalDraftGuard";
import {
  styles,
  getContainerInsetsStyle,
  getScrollContentInsetsStyle,
  getBottomBarInsetsStyle,
  getProgressFillWidthStyle,
} from "./NoticeDocumentsScreen.styles";

export const NoticeDocumentsScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    pan?: string;
    noticeNumber?: string;
    noticeDate?: string;
    responseDueDate?: string;
    noticeType?: string;
    assessmentYear?: string;
  }>();

  const taxNoticeDraft = useApplicationStore((state) => state.taxNoticeDraft);
  const saveTaxNoticeDraft = useApplicationStore((state) => state.saveTaxNoticeDraft);
  const clearTaxNoticeDraft = useApplicationStore((state) => state.clearTaxNoticeDraft);

  const assessmentYear =
    params.assessmentYear ||
    taxNoticeDraft?.formData?.assessmentYear ||
    "AY 2025–26";

  // Pure functional initial state: restore from draft or start clean
  const [docs, setDocs] = useState<TaxNoticeSupportingDoc[]>(() => {
    const savedDocs = taxNoticeDraft?.documents;
    const noticeFile = taxNoticeDraft?.formData?.noticeFileName;
    const noticeUri = taxNoticeDraft?.formData?.noticeFileUri;
    const noticeSize = taxNoticeDraft?.formData?.noticeFileSize;

    const savedMap = new Map((savedDocs || []).map((d) => [d.id, d]));

    return INITIAL_TAX_NOTICE_DOCUMENTS.map((doc) => {
      // Auto-link primary tax notice if uploaded in step 2
      if (doc.id === "doc-notice" && noticeFile && !savedMap.has("doc-notice")) {
        return {
          ...doc,
          status: "uploaded" as const,
          fileName: noticeFile,
          fileUri: noticeUri,
          fileSize: noticeSize || "PDF",
        };
      }

      const saved = savedMap.get(doc.id);
      if (saved) {
        return {
          ...doc,
          status: saved.status,
          fileName: saved.fileName,
          fileUri: saved.fileUri,
          fileSize: saved.fileSize,
          mimeType: saved.mimeType,
        };
      }

      if (doc.id === "doc-ais") {
        return {
          ...doc,
          title: `AIS (${assessmentYear})`,
        };
      }
      return doc;
    });
  });

  const [remarks, setRemarks] = useState(taxNoticeDraft?.remarks || "");

  const uploadedCount = docs.filter(
    (d) => d.status === "uploaded" || !!d.fileUri
  ).length;
  const totalCount = docs.length;
  const percent = totalCount > 0 ? (uploadedCount / totalCount) * 100 : 0;

  // Universal Draft Guard Hook for exit interception
  const {
    showDraftModal,
    openDraftModal,
    handleSaveAndExit,
    handleDiscardAndExit,
    handleCancel,
  } = useUniversalDraftGuard({
    isDirty: () =>
      docs.some((d) => Boolean(d.fileUri || d.status === "uploaded")) ||
      Boolean(remarks.trim()),
    onSaveDraft: () => {
      saveTaxNoticeDraft({
        formData: {
          ...(taxNoticeDraft?.formData || {}),
          ...params,
        },
        documents: docs,
        remarks,
        step: "DOCUMENTS",
        updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
    },
    onDiscardDraft: () => {
      clearTaxNoticeDraft();
    },
  });

  const handleUploadSuccess = (
    id: string,
    fileInfo: { uri: string; name: string; size: string }
  ) => {
    const updated = docs.map((d) =>
      d.id === id
        ? {
            ...d,
            status: "uploaded" as const,
            fileUri: fileInfo.uri,
            fileName: fileInfo.name,
            fileSize: fileInfo.size,
          }
        : d
    );
    setDocs(updated);

    // Persist immediately in draft store
    saveTaxNoticeDraft({
      formData: {
        ...(taxNoticeDraft?.formData || {}),
        ...params,
      },
      documents: updated,
      remarks,
      step: "DOCUMENTS",
      updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
  };

  const handleSubmitDocuments = () => {
    // Persist docs and navigate to Step 5: Customer Approval & Review Response
    saveTaxNoticeDraft({
      formData: {
        ...(taxNoticeDraft?.formData || {}),
        ...params,
      },
      documents: docs,
      remarks,
      step: "REVIEW",
      updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });

    router.push({
      pathname: "/service/tax-notice-review" as any,
      params: {
        pan: params.pan || taxNoticeDraft?.formData?.pan,
        noticeNumber: params.noticeNumber || taxNoticeDraft?.formData?.noticeNumber,
        noticeDate: params.noticeDate || taxNoticeDraft?.formData?.noticeDate,
        assessmentYear: assessmentYear,
        noticeType: params.noticeType || taxNoticeDraft?.formData?.noticeType,
      },
    });
  };

  const getDocIcon = (id: string): keyof typeof Ionicons.glyphMap => {
    switch (id) {
      case "doc-notice":
        return "document-text-outline";
      case "doc-prev-itr":
        return "receipt-outline";
      case "doc-itr-ack":
        return "checkmark-done-circle-outline";
      case "doc-form-16":
        return "newspaper-outline";
      case "doc-ais":
        return "analytics-outline";
      case "doc-tis":
        return "calculator-outline";
      case "doc-bank":
        return "business-outline";
      case "doc-income":
        return "trending-up-outline";
      case "doc-expense":
        return "wallet-outline";
      case "doc-prev-responses":
        return "chatbubbles-outline";
      case "doc-other":
        return "folder-open-outline";
      default:
        return "document-outline";
    }
  };

  return (
    <View style={[styles.container, getContainerInsetsStyle(insets.top)]}>
      <FocusAwareStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Header */}
      <TaxNoticeHeader
        subtitle="Supporting Documents"
        onBack={openDraftModal}
        onSaveDraft={() => {
          saveTaxNoticeDraft({
            formData: {
              ...(taxNoticeDraft?.formData || {}),
              ...params,
            },
            documents: docs,
            remarks,
            step: "DOCUMENTS",
            updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          });
          Alert.alert("Draft Saved", "Your documents have been saved in draft.");
        }}
      />

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          getScrollContentInsetsStyle(insets.bottom),
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Upload Supporting Documents</Text>
          <Text style={styles.pageSubtitle}>
            Upload the documents relevant to this notice. This enables our Tax Executive to verify figures and formulate your legal response.
          </Text>
        </View>

        {/* Progress Section */}
        <View style={styles.progressContainer}>
          <Text style={styles.counterText}>
            {uploadedCount} of {totalCount} documents uploaded
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, getProgressFillWidthStyle(percent)]} />
          </View>
        </View>

        {/* 11 Document Cards */}
        {docs.map((doc) => (
          <NoticeDocUploadCard
            key={doc.id}
            item={doc}
            iconName={getDocIcon(doc.id)}
            onUploadSuccess={handleUploadSuccess}
          />
        ))}

        {/* Remarks Input */}
        <View style={styles.remarksSection}>
          <Text style={styles.remarksLabel}>Remarks / Special Instructions (Optional)</Text>
          <TextInput
            style={styles.remarksInput}
            placeholder="Add any additional context, transaction details, or explanation for our Tax Executive..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={3}
            maxLength={500}
            value={remarks}
            onChangeText={setRemarks}
          />
          <Text style={styles.charCounter}>{remarks.length}/500</Text>
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Button */}
      <View style={[styles.bottomBar, getBottomBarInsetsStyle(insets.bottom)]}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSubmitDocuments}
          style={styles.submitButton}
        >
          <Text style={styles.submitButtonText}>Submit Documents & Review Response</Text>
        </TouchableOpacity>
      </View>

      {/* Universal Draft Modal */}
      <UniversalDraftModal
        visible={showDraftModal}
        title="Save Uploaded Documents?"
        message="Your uploaded files will be saved in your draft so you can resume anytime without re-uploading."
        onSaveAndExit={handleSaveAndExit}
        onDiscardAndExit={handleDiscardAndExit}
        onCancel={handleCancel}
      />
    </View>
  );
};

export default NoticeDocumentsScreen;


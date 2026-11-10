import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { GstReviewUploadedDocsCard, GstReviewUploadedDocItem } from "@/modules/gst/components/common";
import { GstViewDocumentModal } from "@/modules/gst/components/GstDocumentCard";
import {
  styles,
  getHeaderBarStyle,
  getBottomBarStyle,
} from "./GstAmendmentReview.styles";
import {
  AmendmentSectionConfig,
  AmendmentFormData,
  SupportingDoc,
  RegisteredDetails,
} from "../../types/gstAmendmentTypes";
import {
  buildComparisonSummaries,
  buildDbReviewSummaries,
} from "../../utils/gstAmendmentHelpers";

interface GstAmendmentReviewProps {
  gstin: string;
  selectedSection: AmendmentSectionConfig;
  formData: AmendmentFormData;
  registeredDetails: RegisteredDetails;
  supportingDoc: SupportingDoc | null;
  declared: boolean;
  onToggleDeclared: () => void;
  isSubmitting: boolean;
  insets: { top: number; bottom: number };
  scrollViewRef: React.RefObject<ScrollView | null>;
  onEdit: () => void;
  onSubmit: () => void;
  onSaveDraft?: () => void;
  amendmentId?: number | null;
  dbReviewData?: any;
}

export const GstAmendmentReview: React.FC<GstAmendmentReviewProps> = ({
  gstin,
  selectedSection,
  formData,
  registeredDetails,
  supportingDoc,
  declared,
  onToggleDeclared,
  isSubmitting,
  insets,
  scrollViewRef,
  onEdit,
  onSubmit,
  onSaveDraft,
  amendmentId,
  dbReviewData,
}) => {
  const [previewDoc, setPreviewDoc] = useState<GstReviewUploadedDocItem | null>(null);
  const sectionId = selectedSection.id;
  let requestedValDict: Record<string, string> = {};
  switch (Boolean(dbReviewData)) {
    case true:
      requestedValDict = buildDbReviewSummaries(
        sectionId,
        registeredDetails,
        dbReviewData,
        formData
      );
      break;
    case false:
      requestedValDict = buildComparisonSummaries(
        sectionId,
        registeredDetails,
        formData
      ).requestedValDict;
      break;
  }

  return (
    <View style={styles.root}>
      <FocusAwareStatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Header (No back arrow: edits are accessed via the dedicated Edit button) */}
      <View style={[styles.headerBar, getHeaderBarStyle(insets.top)]}>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerMainTitle}>Review Amendment</Text>
          <Text style={styles.headerSubtitle}>Confirm details before submission</Text>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Summary Card */}
        <View style={styles.reviewMetaCard}>
          <View style={styles.reviewMetaRow}>
            <Text style={styles.reviewMetaKey}>Amendment Type</Text>
            <Text style={styles.reviewMetaVal}>
              {selectedSection.type === "core" ? "Core Field" : "Non-Core Field"}
            </Text>
          </View>
          <View style={styles.reviewMetaDivider} />

          <View style={styles.reviewMetaRow}>
            <Text style={styles.reviewMetaKey}>Section</Text>
            <Text style={styles.reviewMetaVal}>{selectedSection.title}</Text>
          </View>
          <View style={styles.reviewMetaDivider} />

          <View style={styles.reviewMetaRow}>
            <Text style={styles.reviewMetaKey}>Target GSTIN</Text>
            <Text style={styles.reviewMetaVal}>{gstin}</Text>
          </View>
        </View>

        {/* Requested Details Card */}
        <View style={styles.requestedDetailsCard}>
          <View style={styles.requestedCardHeaderRow}>
            <Text style={styles.requestedCardTitle}>REQUESTED CHANGES</Text>
            <TouchableOpacity
              style={styles.editOptionBtn}
              activeOpacity={0.7}
              onPress={onEdit}
            >
              <Ionicons name="create-outline" size={14} color={BrandColors.PRIMARY_ORANGE} />
              <Text style={styles.editOptionText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {Object.entries(requestedValDict).map(([label, val]) => (
            <View key={label} style={styles.reviewFieldRow}>
              <Text style={styles.reviewFieldLabel}>{label}</Text>
              <Text style={styles.reviewFieldValue}>{val || "—"}</Text>
            </View>
          ))}
        </View>

        {/* Uploaded Documents Card */}
        {supportingDoc && (
          <GstReviewUploadedDocsCard
            documents={[
              {
                id: "amendment-proof",
                name: supportingDoc.name,
                subtitle: supportingDoc.size,
                fileUri: supportingDoc.uri,
                fileName: supportingDoc.name,
                fileSize: supportingDoc.size,
              },
            ]}
            onEdit={onEdit}
            onPreviewDoc={(doc) => setPreviewDoc(doc)}
          />
        )}

        {/* Declaration Checkbox */}
        <TouchableOpacity
          style={styles.declarationBox}
          activeOpacity={0.8}
          onPress={onToggleDeclared}
        >
          <View style={[styles.checkbox, declared && styles.checkboxActive]}>
            {declared && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
          </View>
          <Text style={styles.declarationText}>
            I hereby declare that the information provided above is true and correct to the best
            of my knowledge, and I authorise Finsolz to submit this amendment request on my behalf.
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={[styles.bottomBar, getBottomBarStyle(insets.bottom)]}>
        <TouchableOpacity
          style={[styles.primaryBtn, (!declared || isSubmitting) && styles.primaryBtnDisabled]}
          activeOpacity={0.8}
          onPress={onSubmit}
          disabled={!declared || isSubmitting}
        >
          <Text style={styles.primaryBtnText}>
            {isSubmitting ? "Submitting Amendment..." : "Submit Amendment"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Full-Screen Document Preview Modal */}
      <GstViewDocumentModal
        visible={Boolean(previewDoc)}
        title={previewDoc?.name || "Document Preview"}
        fileUri={previewDoc?.fileUri}
        fileName={previewDoc?.fileName || previewDoc?.name}
        fileSize={previewDoc?.fileSize}
        fileTypeLabel={
          previewDoc?.fileTypeLabel ||
          previewDoc?.fileName?.split(".").pop()?.toUpperCase()
        }
        mimeType={previewDoc?.mimeType}
        onClose={() => setPreviewDoc(null)}
      />
    </View>
  );
};

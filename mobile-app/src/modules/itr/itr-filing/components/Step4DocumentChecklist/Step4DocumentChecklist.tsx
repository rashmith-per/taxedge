import { SharedItrDocumentCard } from "@/modules/itr/components/documents/SharedItrDocumentCard/SharedItrDocumentCard";
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { ItrDocumentItem } from "../../types/itrFiling.types";
import {
  DocumentUploadModal,
  UploadedFileInfo,
} from "../DocumentUploadModal/DocumentUploadModal";
import { DocumentPreviewModal } from "../DocumentPreviewModal/DocumentPreviewModal";
import { styles, getProgressBarFill } from "./Step4DocumentChecklist.styles";

interface Step4DocumentChecklistProps {
  isEditing?: boolean;
  documents: ItrDocumentItem[];
  onUpdateDocument: (docId: string, fileInfo: UploadedFileInfo | null) => void;
  onContinue: () => void;
}

export const Step4DocumentChecklist: React.FC<Step4DocumentChecklistProps> = ({ isEditing, 
  documents,
  onUpdateDocument,
  onContinue,
}) => {
  const [activeUploadDoc, setActiveUploadDoc] = useState<ItrDocumentItem | null>(null);
  const [previewDoc, setPreviewDoc] = useState<ItrDocumentItem | null>(null);

  const requiredDocs = documents.filter((d) => d.tier === "REQUIRED");
  const recommendedDocs = documents.filter((d) => d.tier === "RECOMMENDED");
  const applicableDocs = documents.filter(
    (d) => d.tier === "ONLY_IF_APPLICABLE" || (!["REQUIRED", "RECOMMENDED"].includes(d.tier) && d.tier !== "NOT_REQUIRED")
  );

  const uploadedCount = documents.reduce(
    (count, doc) => (Boolean(doc.fileUri) ? count + 1 : count),
    0
  );
  const totalCount = documents.length;
  const progressPercent = totalCount > 0 ? Math.round((uploadedCount / totalCount) * 100) : 0;

  const handleUploadClick = (doc: ItrDocumentItem) => {
    setActiveUploadDoc(doc);
  };

  const handleFilePicked = (file: UploadedFileInfo) => {
    if (!activeUploadDoc) return;
    onUpdateDocument(activeUploadDoc.id, file);
    setActiveUploadDoc(null);
  };

  const handleRemoveDoc = (docId: string) => {
    Alert.alert(
      "Remove Document",
      "Are you sure you want to remove this uploaded file?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => onUpdateDocument(docId, null),
        },
      ]
    );
  };

  const handleContinuePress = () => {
    const missingRequired = requiredDocs.filter((doc) => !doc.fileUri);

    if (missingRequired.length > 0) {
      const missingNames = missingRequired.map((d) => `• ${d.name} *`).join("\n");
      Alert.alert(
        "Required Documents Missing",
        `Please upload the following required documents before proceeding:\n\n${missingNames}`
      );
      return;
    }

    onContinue();
  };

  const renderDocCard = (doc: ItrDocumentItem) => {
    return (
      <SharedItrDocumentCard
        key={doc.id}
        item={{
          id: doc.id,
          title: doc.name,
          subtitle: doc.profileVerifiedLabel || doc.subtitle,
          isMandatory: doc.required,
          status: doc.fileUri ? "uploaded" : "not_uploaded",
          fileUri: doc.fileUri,
          fileName: doc.fileName,
          fileSize: doc.fileSize,
          iconType: doc.iconName || "business_income",
        }}
        onUploadSuccess={(id: string, fileInfo) => {
          onUpdateDocument(id, fileInfo);
        }}
        onRemove={(id: string) => {
          onUpdateDocument(id, { uri: "", name: "", size: "" });
        }}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Upload Progress Tracker */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeaderRow}>
          <Text style={styles.progressCounterText}>
            Documents Uploaded: {uploadedCount} of {totalCount}
          </Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>{progressPercent}% Ready</Text>
          </View>
        </View>

        <View style={styles.progressBarTrack}>
          <View style={getProgressBarFill(progressPercent)} />
        </View>

        <View style={styles.instructionRow}>
          <Ionicons name="shield-checkmark-outline" size={22} color="#083B75" />
          <View style={styles.instructionTextCol}>
            <Text style={styles.instructionTitle}>Document Checklist</Text>
            <Text style={styles.instructionDetail}>
              Upload applicable documents for CA review. PAN and Aadhaar identity are pre-verified from your profile.
            </Text>
          </View>
        </View>
      </View>

      {/* 1. Required Documents */}
      {requiredDocs.length > 0 && (
        <View style={styles.groupSection}>
          <View style={styles.groupHeader}>
            <Text style={styles.groupTitle}>Required Documents</Text>
            <View style={[styles.groupTag, styles.groupTagRequired]}>
              <Text style={styles.groupTagTextRequired}>Mandatory ({requiredDocs.length})</Text>
            </View>
          </View>
          <View style={styles.docsList}>{requiredDocs.map(renderDocCard)}</View>
        </View>
      )}

      {/* 2. Recommended Documents */}
      {recommendedDocs.length > 0 && (
        <View style={styles.groupSection}>
          <View style={styles.groupHeader}>
            <Text style={styles.groupTitle}>Recommended Documents</Text>
            <View style={[styles.groupTag, styles.groupTagRecommended]}>
              <Text style={styles.groupTagTextRecommended}>Recommended ({recommendedDocs.length})</Text>
            </View>
          </View>
          <View style={styles.docsList}>{recommendedDocs.map(renderDocCard)}</View>
        </View>
      )}

      {/* 3. Only If Applicable */}
      {applicableDocs.length > 0 && (
        <View style={styles.groupSection}>
          <View style={styles.groupHeader}>
            <Text style={styles.groupTitle}>Only If Applicable</Text>
            <View style={styles.groupTag}>
              <Text style={styles.groupTagText}>Optional ({applicableDocs.length})</Text>
            </View>
          </View>
          <View style={styles.docsList}>{applicableDocs.map(renderDocCard)}</View>
        </View>
      )}

      {/* Continue Button */}
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.continueButton}
        onPress={handleContinuePress}
      >
        <Text style={styles.continueButtonText}>{isEditing ? "Update and Continue" : "Confirm & Continue to Review"}</Text>
        <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Upload Modal */}
      {activeUploadDoc && (
        <DocumentUploadModal
          visible={Boolean(activeUploadDoc)}
          docTitle={activeUploadDoc.name}
          onFilePicked={handleFilePicked}
          onClose={() => setActiveUploadDoc(null)}
        />
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <DocumentPreviewModal
          visible={Boolean(previewDoc)}
          document={previewDoc}
          onClose={() => setPreviewDoc(null)}
          onChangeFile={(doc) => {
            setPreviewDoc(null);
            setActiveUploadDoc(doc);
          }}
        />
      )}
    </View>
  );
};

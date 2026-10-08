import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { DocumentUploadBottomSheet } from "@/shared/components/DocumentUploadBottomSheet";
import type { LoanDocumentItem, LoanDocumentCategory } from "../../../types/loans.types";
import type { LoanDocuments } from "../../../hooks/useLoanDocuments";
import { DocumentPreviewModal } from "../../../components/DocumentPreviewModal";
import { getDocumentIconName, type IoniconName } from "../../../utils/documentIcon";
import { getProgressWidth } from "../../../styles/loanScreenLayout.styles";
import { styles } from "./LoanCategorizedDocumentsStep.styles";

/** One checklist section: documents whose `category` matches `name`. */
export interface LoanDocumentCategoryConfig {
  name: LoanDocumentCategory;
  icon: IoniconName;
  /** Header text when it differs from the category name. */
  label?: string;
}

export interface LoanCategorizedDocumentsStepProps {
  /** Sections in display order; empty sections are hidden. */
  categories: readonly LoanDocumentCategoryConfig[];
  /** Document checklist state from `useLoanDocuments`, owned by the screen. */
  loanDocuments: LoanDocuments;
}

const ACTION_COLORS = {
  preview: BrandColors.TEXT_PRIMARY,
  replace: BrandColors.TEXT_SECONDARY,
  delete: "#DC2626",
} as const;

export const LoanCategorizedDocumentsStep: React.FC<LoanCategorizedDocumentsStepProps> = ({
  categories,
  loanDocuments,
}) => {
  const { documents, progress, openUpload, removeDocument, openPreview, uploadSheetProps, previewModalProps } =
    loanDocuments;
  const { uploadedRequired, totalRequired, requiredPercent } = progress;

  const handleDelete = (item: LoanDocumentItem) => {
    Alert.alert(
      "Remove Document?",
      `Are you sure you want to remove "${item.name}"? You will need to upload it again before submission.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => removeDocument(item.id),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* 1. Mandatory Progress Tracker Card */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Document Checklist Progress</Text>
          <Text style={styles.progressCount}>
            {uploadedRequired} of {totalRequired} ({requiredPercent}%)
          </Text>
        </View>
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, getProgressWidth(requiredPercent)]} />
        </View>
        <Text style={styles.formatHint}>
          Supported formats: PDF, JPG, PNG, Word (.docx), Excel (.xlsx) • Max 10MB per file
        </Text>
      </View>

      {/* 2. Grouped Category Cards */}
      {categories.map(({ name: cat, icon, label }) => {
        const catDocs = documents.filter((d) => d.category === cat);
        if (catDocs.length === 0) return null;

        return (
          <View key={cat} style={styles.categoryContainer}>
            <View style={styles.categoryHeaderRow}>
              <Ionicons name={icon} size={16} color={BrandColors.PRIMARY_ORANGE} />
              <Text style={styles.categoryHeader}>{label ?? cat}</Text>
            </View>

            {catDocs.map((item) => {
              const isUploaded = Boolean(item.fileUri);

              return (
                <View key={item.id} style={[styles.docCard, isUploaded && styles.docCardUploaded]}>
                  <View style={styles.docCardTopRow}>
                    <View style={styles.docLeft}>
                      <View style={styles.iconBox}>
                        <Ionicons
                          name={getDocumentIconName(item.iconName)}
                          size={20}
                          color={BrandColors.PRIMARY_ORANGE}
                        />
                      </View>

                      <View style={styles.docInfo}>
                        <View style={styles.docNameRow}>
                          <Text style={styles.docName}>{item.name}</Text>
                          {item.required ? (
                            <View style={styles.requiredBadge}>
                              <Text style={styles.requiredText}>Required</Text>
                            </View>
                          ) : (
                            <View style={styles.optionalBadge}>
                              <Text style={styles.optionalText}>Optional</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.docSubtitle}>{item.subtitle}</Text>
                        {isUploaded && item.fileName && (
                          <Text style={styles.docFileDetails}>
                            ✓ {item.fileName} ({item.fileSize || "File"})
                          </Text>
                        )}
                      </View>
                    </View>

                    {!isUploaded && (
                      <TouchableOpacity style={styles.uploadButton} onPress={() => openUpload(item.id)}>
                        <Ionicons
                          name="arrow-up-circle-outline"
                          size={15}
                          color={BrandColors.PRIMARY_ORANGE_DARK}
                        />
                        <Text style={styles.uploadButtonText}>Upload</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Actions for Uploaded Documents: Preview, Replace, Delete */}
                  {isUploaded && (
                    <View style={styles.docActionsRow}>
                      <TouchableOpacity style={styles.previewButton} onPress={() => openPreview(item.id)}>
                        <Ionicons name="eye-outline" size={14} color={ACTION_COLORS.preview} />
                        <Text style={styles.previewButtonText}>Preview</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.reuploadButton} onPress={() => openUpload(item.id)}>
                        <Ionicons name="cloud-upload-outline" size={14} color={ACTION_COLORS.replace} />
                        <Text style={styles.reuploadButtonText}>Replace</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item)}>
                        <Ionicons name="trash-outline" size={13} color={ACTION_COLORS.delete} />
                        <Text style={styles.deleteButtonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        );
      })}

      <DocumentUploadBottomSheet {...uploadSheetProps} />
      <DocumentPreviewModal {...previewModalProps} />
    </View>
  );
};

export default LoanCategorizedDocumentsStep;

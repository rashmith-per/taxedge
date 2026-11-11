import React, { memo } from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { GstReviewEditButton } from "./GstReviewEditButton";
import { styles } from "./GstReviewUploadedDocsCard.styles";

export interface GstReviewUploadedDocItem {
  id: string;
  name: string;
  subtitle?: string;
  fileUri?: string;
  fileName?: string;
  fileSize?: string;
  fileTypeLabel?: string;
  mimeType?: string;
}

export interface GstReviewUploadedDocsCardProps {
  documents: GstReviewUploadedDocItem[];
  onEdit: () => void;
  onPreviewDoc: (doc: GstReviewUploadedDocItem) => void;
  title?: string;
  emptyText?: string;
}

export const GstReviewUploadedDocsCard: React.FC<GstReviewUploadedDocsCardProps> = memo(({
  documents,
  onEdit,
  onPreviewDoc,
  title = "Uploaded Documents",
  emptyText,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        <GstReviewEditButton
          onPress={onEdit}
          accessibilityLabel={`Edit ${title}`}
        />
      </View>

      {documents.length > 0 ? (
        <View style={styles.uploadedDocList}>
          {documents.map((doc) => (
            <TouchableOpacity
              key={doc.id}
              style={styles.uploadedDocItem}
              activeOpacity={0.7}
              onPress={() => onPreviewDoc(doc)}
            >
              <Ionicons name="checkmark-circle" size={18} color="#059669" />
              <View style={styles.uploadedDocTextCol}>
                <Text style={styles.uploadedDocName} numberOfLines={1}>
                  {doc.name}
                </Text>
                {doc.subtitle ? (
                  <Text style={styles.uploadedDocSubtitle}>
                    {doc.subtitle}
                  </Text>
                ) : null}
              </View>
              {Platform.OS === "ios" ? (
                <TouchableOpacity
                  style={styles.eyeIconBox}
                  activeOpacity={0.7}
                  onPress={(e) => {
                    e?.stopPropagation?.();
                    onPreviewDoc(doc);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Preview ${doc.name}`}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name="eye-outline"
                    size={18}
                    color={BrandColors.PRIMARY_BLUE}
                  />
                </TouchableOpacity>
              ) : (
                <View style={styles.eyeIconBox}>
                  <Ionicons
                    name="eye-outline"
                    size={18}
                    color={BrandColors.PRIMARY_BLUE}
                  />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      ) : emptyText ? (
        <Text style={styles.emptyDocText}>{emptyText}</Text>
      ) : null}
    </View>
  );
});

GstReviewUploadedDocsCard.displayName = "GstReviewUploadedDocsCard";
export default GstReviewUploadedDocsCard;

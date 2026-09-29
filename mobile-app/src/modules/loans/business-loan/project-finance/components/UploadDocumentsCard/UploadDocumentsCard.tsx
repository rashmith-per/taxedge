import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as DocumentPicker from "expo-document-picker";
import {
  DocumentUploadItem,
  DOCUMENT_CATEGORIES,
} from "../../data/step7Data";
import { DocumentPreviewModal } from "./DocumentPreviewModal";
import { styles } from "./UploadDocumentsCard.styles";

interface UploadDocumentsCardProps {
  documents: DocumentUploadItem[];
  onUploadDocument: (
    id: string,
    file: { name: string; uri: string; size: string }
  ) => void;
  onDeleteDocument: (id: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const UploadDocumentsCard: React.FC<UploadDocumentsCardProps> = ({
  documents,
  onUploadDocument,
  onDeleteDocument,
  isExpanded,
  onToggleExpand,
}) => {
  const [selectedCategory, setSelectedCategory] =
    useState<string>("All Documents");
  const [viewingDoc, setViewingDoc] = useState<DocumentUploadItem | null>(null);

  const filteredDocs =
    selectedCategory === "All Documents"
      ? documents
      : documents.filter((d) => d.category === selectedCategory);

  const handlePickDocument = async (docId: string, docName: string) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "image/*",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const rawSize = asset.size || 1024 * 1024 * 1.5;
        const sizeMb = `${(rawSize / (1024 * 1024)).toFixed(2)} MB`;
        const filename =
          asset.name || `${docName.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;

        onUploadDocument(docId, {
          name: filename,
          uri: asset.uri,
          size: sizeMb,
        });
      }
    } catch {
      // Fallback
      const filename = `${docName.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
      onUploadDocument(docId, {
        name: filename,
        uri: "https://example.com/sample.pdf",
        size: "1.45 MB",
      });
    }
  };

  const handleDelete = (docId: string) => {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.confirm("Are you sure you want to remove this document?")) {
        onDeleteDocument(docId);
      }
    } else {
      Alert.alert(
        "Delete Document",
        "Are you sure you want to remove this uploaded document?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => onDeleteDocument(docId),
          },
        ]
      );
    }
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={onToggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <View style={styles.iconBadge}>
            <Ionicons name="document-text-outline" size={18} color="#F97316" />
          </View>
          <Text style={styles.cardTitle}>1. Upload Documents</Text>
        </View>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color="#64748B"
        />
      </TouchableOpacity>

      {/* Body */}
      {isExpanded && (
        <View style={styles.cardBody}>
          <Text style={styles.subtitle}>
            Upload the required documents for your project finance application.
          </Text>

          {/* Category Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsScroll}
            contentContainerStyle={styles.tabsContainer}
          >
            {DOCUMENT_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.tabPill, isActive && styles.tabPillActive]}
                  onPress={() => setSelectedCategory(cat)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[styles.tabText, isActive && styles.tabTextActive]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Documents List */}
          {filteredDocs.map((doc) => {
            const isUploaded = !!doc.uploadedFileName;
            return (
              <View key={doc.id} style={styles.docItem}>
                <View style={styles.docLeft}>
                  <View style={styles.docIconCircle}>
                    <Ionicons
                      name={doc.iconName as any}
                      size={20}
                      color="#2563EB"
                    />
                  </View>
                  <View style={styles.docMeta}>
                    <Text style={styles.docName}>
                      {doc.name}{" "}
                      {doc.isRequired && (
                        <Text style={styles.requiredStar}>*</Text>
                      )}
                    </Text>
                    {isUploaded ? (
                      <Text style={styles.uploadedText}>
                        ✓ {doc.uploadedFileName}
                        {doc.uploadedFileSize ? ` (${doc.uploadedFileSize})` : ""}
                      </Text>
                    ) : (
                      <Text style={styles.docFormat}>{doc.formatInfo}</Text>
                    )}
                  </View>
                </View>

                {isUploaded ? (
                  <View style={styles.docActions}>
                    <TouchableOpacity
                      style={styles.viewButton}
                      onPress={() => setViewingDoc(doc)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="eye-outline" size={15} color="#2563EB" />
                      <Text style={styles.viewButtonText}>View</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDelete(doc.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="trash-outline" size={16} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={() => handlePickDocument(doc.id, doc.name)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="cloud-upload-outline"
                      size={17}
                      color="#EA580C"
                    />
                    <Text style={styles.uploadButtonText}>Upload File</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* Document View Preview Modal */}
      <DocumentPreviewModal
        document={viewingDoc}
        visible={!!viewingDoc}
        onClose={() => setViewingDoc(null)}
      />
    </View>
  );
};

export default UploadDocumentsCard;

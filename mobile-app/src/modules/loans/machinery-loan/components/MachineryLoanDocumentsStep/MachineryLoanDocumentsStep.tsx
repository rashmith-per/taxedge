import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "../../../../../shared/theme";
import {
  LoanDocumentItem,
  LoanDocumentCategory,
} from "../../../types/loans.types";
import {
  pickLoanImageFromGallery,
  pickLoanImageFromCamera,
} from "../../../services/documentUploadHelper";
import { styles } from "./MachineryLoanDocumentsStep.styles";

export interface MachineryLoanDocumentsStepProps {
  documents: LoanDocumentItem[];
  onDocumentUploaded: (
    docId: string,
    fileUri: string,
    fileName: string,
    fileSize: string
  ) => void;
}

const CATEGORIES: LoanDocumentCategory[] = [
  "Identity & Address",
  "Income & Banking",
  "Business & Tax",
  "Collateral & Others",
];

export const MachineryLoanDocumentsStep: React.FC<MachineryLoanDocumentsStepProps> = ({
  documents,
  onDocumentUploaded,
}) => {
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const totalRequired = documents.filter((d) => d.required).length;
  const uploadedRequired = documents.filter(
    (d) => d.required && Boolean(d.fileUri)
  ).length;
  const progressPercent =
    totalRequired > 0
      ? Math.round((uploadedRequired / totalRequired) * 100)
      : 100;

  const handleOpenUploadSheet = (docId: string) => {
    setActiveDocId(docId);
    setModalVisible(true);
  };

  const handlePickGallery = async () => {
    setModalVisible(false);
    if (!activeDocId) return;
    const file = await pickLoanImageFromGallery();
    if (file) {
      onDocumentUploaded(activeDocId, file.uri, file.name, file.size);
    }
  };

  const handlePickCamera = async () => {
    setModalVisible(false);
    if (!activeDocId) return;
    const file = await pickLoanImageFromCamera();
    if (file) {
      onDocumentUploaded(activeDocId, file.uri, file.name, file.size);
    }
  };

  const handleMockPdf = () => {
    setModalVisible(false);
    if (!activeDocId) return;
    const doc = documents.find((d) => d.id === activeDocId);
    const mockName = `${doc?.name.replace(/\s+/g, "_") || "proforma_invoice"}.pdf`;
    onDocumentUploaded(
      activeDocId,
      `file:///mock/storage/${mockName}`,
      mockName,
      "2.2 MB"
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Required Documents</Text>
      <Text style={styles.sectionSubtitle}>
        Upload minimum KYC, bank statement and OEM quotation to process machinery loan.
      </Text>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Required documents</Text>
          <Text style={styles.progressCount}>
            {uploadedRequired} / {totalRequired} ({progressPercent}%)
          </Text>
        </View>
        <View style={styles.progressBarTrack}>
          <View
            style={{
              height: "100%",
              width: `${progressPercent}%`,
              backgroundColor:
                progressPercent === 100 ? "#16A34A" : BrandColors.PRIMARY_BLUE,
              borderRadius: 3,
            }}
          />
        </View>
      </View>

      {/* Categorized Document List */}
      {CATEGORIES.map((category) => {
        const categoryDocs = documents.filter((d) => d.category === category);
        if (categoryDocs.length === 0) return null;

        return (
          <View key={category} style={styles.categoryContainer}>
            <Text style={styles.categoryHeader}>{category}</Text>
            {categoryDocs.map((doc) => {
              const isUploaded = Boolean(doc.fileUri);

              return (
                <View
                  key={doc.id}
                  style={[
                    styles.docCard,
                    isUploaded && styles.docCardUploaded,
                  ]}
                >
                  <View style={styles.docLeft}>
                    <View
                      style={[
                        styles.iconBox,
                        { backgroundColor: doc.iconBg || "#F1F5F9" },
                      ]}
                    >
                      <Ionicons
                        name={(doc.iconName as any) || "document-text"}
                        size={20}
                        color={doc.iconColor || BrandColors.PRIMARY_BLUE}
                      />
                    </View>

                    <View style={styles.docInfo}>
                      <View style={styles.docNameRow}>
                        <Text style={styles.docName}>{doc.name}</Text>
                        {doc.required ? (
                          <View style={styles.requiredBadge}>
                            <Text style={styles.requiredText}>Required</Text>
                          </View>
                        ) : (
                          <View style={styles.optionalBadge}>
                            <Text style={styles.optionalText}>Optional</Text>
                          </View>
                        )}
                      </View>

                      <Text style={styles.docSubtitle} numberOfLines={2}>
                        {doc.subtitle}
                      </Text>

                      {isUploaded && (
                        <View style={styles.fileMetaRow}>
                          <Ionicons
                            name="checkmark-circle"
                            size={14}
                            color="#16A34A"
                          />
                          <Text style={styles.fileNameText} numberOfLines={1}>
                            {doc.fileName || "Uploaded"}
                          </Text>
                          <Text style={styles.fileSizeText}>
                            ({doc.fileSize || "1.9 MB"})
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {isUploaded ? (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleOpenUploadSheet(doc.id)}
                      style={styles.replaceButton}
                    >
                      <Ionicons name="refresh" size={14} color="#16A34A" />
                      <Text style={styles.replaceButtonText}>Replace</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleOpenUploadSheet(doc.id)}
                      style={styles.uploadButton}
                    >
                      <Ionicons
                        name="cloud-upload-outline"
                        size={14}
                        color={BrandColors.PRIMARY_BLUE}
                      />
                      <Text style={styles.uploadButtonText}>Upload</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        );
      })}

      {/* Upload Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.sheetContent}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Select Upload Method</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.sheetOption}
              onPress={handlePickCamera}
            >
              <Ionicons
                name="camera-outline"
                size={22}
                color={BrandColors.PRIMARY_BLUE}
              />
              <Text style={styles.sheetOptionText}>Take Photo with Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sheetOption}
              onPress={handlePickGallery}
            >
              <Ionicons
                name="images-outline"
                size={22}
                color={BrandColors.PRIMARY_BLUE}
              />
              <Text style={styles.sheetOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sheetOption}
              onPress={handleMockPdf}
            >
              <Ionicons
                name="document-attach-outline"
                size={22}
                color={BrandColors.PRIMARY_BLUE}
              />
              <Text style={styles.sheetOptionText}>Attach Machinery Quotation PDF</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default MachineryLoanDocumentsStep;

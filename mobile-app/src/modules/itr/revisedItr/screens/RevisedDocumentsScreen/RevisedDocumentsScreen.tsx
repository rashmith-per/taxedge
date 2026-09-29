import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { DocumentUploadBottomSheet } from "@/modules/itr/tds/components/upload/DocumentUploadBottomSheet/DocumentUploadBottomSheet";
import { RevisedItrHeader } from "../../components/common";
import { REVISED_SUPPORTING_DOCUMENTS } from "../../mock/revisedItrData";
import { RevisedDocumentItem } from "../../types/revisedItr.types";
import {
  styles,
  getContainerInsetsStyle,
  getScrollContentInsetsStyle,
  getBottomBarInsetsStyle,
  getProgressFillWidthStyle,
} from "./RevisedDocumentsScreen.styles";

export const RevisedDocumentsScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    acknowledgementNumber?: string;
    assessmentYear?: string;
    revisionReason?: string;
    revisedDetails?: string;
  }>();

  const assessmentYear = params.assessmentYear || "AY 2025–26";

  const [documents, setDocuments] = useState<RevisedDocumentItem[]>(() =>
    REVISED_SUPPORTING_DOCUMENTS.map((doc) =>
      doc.id === "doc-3"
        ? {
            ...doc,
            title: `Form 16 / Form 16A (${assessmentYear})`,
          }
        : doc
    )
  );

  const isDocRequired = (docId: string, reason?: string): boolean => {
    if (docId === "doc-1" || docId === "doc-2") return true;
    if (reason === "missed_income" && (docId === "doc-3" || docId === "doc-4")) return true;
    if (reason === "wrong_deduction" && docId === "doc-6") return true;
    if (reason === "incorrect_bank" && docId === "doc-5") return true;
    return false;
  };

  const uploadedCount = documents.filter(
    (d) => d.status === "uploaded" || !!d.fileUri
  ).length;
  const totalCount = documents.length;
  const isCompleted = uploadedCount === totalCount && totalCount > 0;
  const percent = totalCount > 0 ? (uploadedCount / totalCount) * 100 : 0;

  const [selectedDocForUpload, setSelectedDocForUpload] = useState<RevisedDocumentItem | null>(null);

  const handleFileSelected = (uri: string, name: string, size?: number) => {
    if (!selectedDocForUpload) return;
    if (size && size > 10 * 1024 * 1024) {
      Alert.alert("File Too Large", "Maximum supported file size is 10 MB.");
      return;
    }

    const sizeInMb = size
      ? `${(size / (1024 * 1024)).toFixed(1)} MB`
      : "2.1 MB";

    const docId = selectedDocForUpload.id;
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === docId
          ? {
              ...d,
              status: "uploaded",
              fileUri: uri,
              fileName: name,
              fileSize: sizeInMb,
            }
          : d
      )
    );
    setSelectedDocForUpload(null);
  };

  const handlePickFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/jpeg", "image/png"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        handleFileSelected(asset.uri, asset.name, asset.size);
      }
    } catch {
      Alert.alert("Upload Error", "Could not open file picker.");
    }
  };

  const handlePickGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Photo library permission is needed to upload documents.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileName = asset.fileName || `revised_doc_${Date.now()}.jpg`;
        handleFileSelected(asset.uri, fileName, (asset as any).fileSize);
      }
    } catch {
      Alert.alert("Gallery Error", "Could not open photo gallery. Please try again.");
    }
  };

  const handlePickCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Camera permission is needed to photograph documents.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileName = asset.fileName || `revised_doc_${Date.now()}.jpg`;
        handleFileSelected(asset.uri, fileName, (asset as any).fileSize);
      }
    } catch {
      Alert.alert("Camera Error", "Could not open camera. Please try again.");
    }
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              status: "not_uploaded",
              fileUri: undefined,
              fileName: undefined,
              fileSize: undefined,
            }
          : d
      )
    );
  };

  const handleContinue = () => {
    // Navigate to Screen 5: Review Revised Computation
    router.push({
      pathname: "/service/revised-itr-review" as any,
      params: {
        acknowledgementNumber: params.acknowledgementNumber,
        assessmentYear,
        revisionReason: params.revisionReason,
        revisedDetails: params.revisedDetails,
        uploadedDocsCount: uploadedCount.toString(),
        totalDocsCount: totalCount.toString(),
      },
    });
  };

  const requiredDocs = documents.filter((d) => isDocRequired(d.id, params.revisionReason));
  const additionalDocs = documents.filter((d) => !isDocRequired(d.id, params.revisionReason));

  const renderDocCard = (item: RevisedDocumentItem, isRequired: boolean) => {
    const isUploaded = item.status === "uploaded" || !!item.fileUri;

    return (
      <View key={item.id} style={styles.docCard}>
        {isUploaded ? (
          <View style={styles.uploadedBox}>
            <View style={styles.fileMetaRow}>
              <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
              <Text style={styles.fileNameText} numberOfLines={1}>
                {item.fileName || item.title}
              </Text>
              <Text style={styles.fileSizeText}>{item.fileSize || "2.1 MB"}</Text>
            </View>
            <View style={styles.actionsRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => Alert.alert("View Document", item.fileName || item.title)}
                style={styles.actionBtn}
              >
                <Text style={styles.actionBtnText}>View</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setSelectedDocForUpload(item)}
                style={styles.actionBtn}
              >
                <Text style={styles.actionBtnText}>Change</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleDeleteDocument(item.id)}
                style={[styles.actionBtn, styles.actionBtnDelete]}
              >
                <Text style={styles.deleteBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.docRow}>
            <View style={styles.docInfo}>
              <Text style={styles.docTitle}>{item.title}</Text>
              <Text style={isRequired ? styles.requiredBadgeText : styles.optionalBadgeText}>
                {isRequired ? "Required" : "Optional"}
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setSelectedDocForUpload(item)}
              style={styles.uploadButton}
            >
              <Text style={styles.uploadButtonText}>Upload</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, getContainerInsetsStyle(insets.top)]}>
      <FocusAwareStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Header */}
      <RevisedItrHeader subtitle="Documents & Submission" />

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
          <Text style={styles.pageTitle}>Upload Documents</Text>
          <Text style={styles.pageSubtitle}>
            Upload proofs for the corrections made in your revised return.
          </Text>
        </View>

        {/* Upload Progress Header */}
        <View style={styles.progressContainer}>
          <View style={styles.progressRow}>
            <Text style={styles.counterText}>
              {uploadedCount} of {totalCount} documents uploaded
            </Text>
            <View style={styles.inProgressBadge}>
              <Text style={styles.inProgressText}>
                {isCompleted ? "Completed" : "In Progress"}
              </Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, getProgressFillWidthStyle(percent)]} />
          </View>
        </View>

        {/* Required Documents Section */}
        {requiredDocs.length > 0 && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Required Documents</Text>
            </View>
            {requiredDocs.map((item) => renderDocCard(item, true))}
          </View>
        )}

        {/* Additional Documents Section */}
        {additionalDocs.length > 0 && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Additional Documents</Text>
            </View>
            {additionalDocs.map((item) => renderDocCard(item, false))}
          </View>
        )}
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
          onPress={handleContinue}
          style={styles.continueButton}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>

      {/* Unified Document Upload Bottom Sheet */}
      <DocumentUploadBottomSheet
        visible={!!selectedDocForUpload}
        documentTitle={selectedDocForUpload?.title || "Document"}
        maxSizeBytesText="10 MB"
        onClose={() => setSelectedDocForUpload(null)}
        onPickFiles={handlePickFiles}
        onPickGallery={handlePickGallery}
        onTakePhoto={handlePickCamera}
      />
    </View>
  );
};

export default RevisedDocumentsScreen;

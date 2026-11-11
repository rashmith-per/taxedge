import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  ActivityIndicator,
  Alert,
  TouchableWithoutFeedback,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { PdfViewerModal } from "@/shared/components/PdfViewerModal";
import {
  PDF_APP_MISSING_MESSAGE,
  PDF_VIEWER_UNAVAILABLE_NOTICE,
  isInAppPdfViewerAvailable,
  openPdfInAnotherApp,
} from "../../../utils/tdsPdfViewing";
import { styles } from "./ViewDocumentModal.styles";

interface ViewDocumentModalProps {
  visible: boolean;
  title: string;
  fileUri?: string;
  fileName?: string;
  fileSize?: string;
  fileTypeLabel?: string;
  mimeType?: string;
  onClose: () => void;
}

function resolveIsImage(
  fileUri: string | undefined,
  mimeType: string | undefined,
  fileTypeLabel: string | undefined
): boolean {
  if (!fileUri) return false;
  if (mimeType?.startsWith("image/")) return true;
  const label = (fileTypeLabel || "").toUpperCase();
  if (label === "JPG" || label === "JPEG" || label === "PNG") return true;
  const lower = fileUri.toLowerCase();
  return lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png");
}

function resolveIsPdf(
  fileUri: string | undefined,
  mimeType: string | undefined,
  fileName: string | undefined
): boolean {
  if (mimeType === "application/pdf") return true;
  if ((fileName || "").toLowerCase().endsWith(".pdf")) return true;
  return (fileUri || "").toLowerCase().endsWith(".pdf");
}

export const ViewDocumentModal: React.FC<ViewDocumentModalProps> = ({
  visible,
  title,
  fileUri,
  fileName,
  fileSize,
  fileTypeLabel,
  mimeType,
  onClose,
}) => {
  const isImage = resolveIsImage(fileUri, mimeType, fileTypeLabel);
  const isPdf = !isImage && resolveIsPdf(fileUri, mimeType, fileName);

  const [openingExternally, setOpeningExternally] = useState(false);
  const inAppPdfAvailable = isPdf ? isInAppPdfViewerAvailable() : true;

  const handleOpenExternally = async () => {
    if (!fileUri || openingExternally) return;
    setOpeningExternally(true);
    const result = await openPdfInAnotherApp(fileUri, title);
    setOpeningExternally(false);
    if (result === "no-app") {
      Alert.alert("No PDF App Found", PDF_APP_MISSING_MESSAGE);
    } else if (result === "failed") {
      Alert.alert("Could Not Open PDF", "The file could not be opened. It may have been moved or deleted.");
    }
  };

  if (isPdf && fileUri && inAppPdfAvailable) {
    // PDFs open in the in-app viewer. Viewing never hands the file to the system share sheet.
    return (
      <PdfViewerModal
        visible={visible}
        fileUri={fileUri}
        title={title}
        fileName={fileName}
        onClose={onClose}
      />
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title} numberOfLines={1}>
                  {title}
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onClose}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Preview Area */}
              <View style={styles.previewBox}>
                {isImage && fileUri ? (
                  <Image source={{ uri: fileUri }} style={styles.previewImage} />
                ) : (
                  <View style={styles.placeholderBox}>
                    <Ionicons
                      name={isPdf ? "document-text" : "document-attach-outline"}
                      size={54}
                      color={isPdf ? "#EF4444" : "#083B75"}
                    />
                    <Text style={styles.placeholderText}>
                      {isPdf ? "PDF Document" : (fileTypeLabel || "Document")}
                    </Text>
                  </View>
                )}
              </View>

              {/* File metadata */}
              {(fileName || fileSize) && (
                <View style={styles.metaContainer}>
                  {fileName ? (
                    <Text style={styles.fileNameText} numberOfLines={1}>
                      {fileName}
                    </Text>
                  ) : null}
                  {fileSize ? (
                    <Text style={styles.fileMetaText}>{fileSize}</Text>
                  ) : null}
                </View>
              )}

              {/* This build has no in-app PDF viewer: explain and offer an explicit external open */}
              {isPdf && fileUri && !inAppPdfAvailable ? (
                <>
                  <Text style={[styles.fileMetaText, { textAlign: "center", marginTop: 12 }]}>
                    {PDF_VIEWER_UNAVAILABLE_NOTICE}
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleOpenExternally}
                    disabled={openingExternally}
                    style={styles.openPdfButton}
                  >
                    {openingExternally ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons name="open-outline" size={16} color="#FFFFFF" />
                        <Text style={styles.openPdfButtonText}>Open in another app</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </>
              ) : null}

              {/* Done Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onClose}
                style={styles.doneButton}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ViewDocumentModal;

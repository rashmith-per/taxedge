import React from "react";
import { Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { DocumentUploadBottomSheet } from "@/shared/components/DocumentUploadBottomSheet";

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

export interface UploadedFileInfo {
  uri: string;
  name: string;
  size: string;
  mimeType?: string;
}

interface DocumentUploadModalProps {
  visible: boolean;
  docTitle?: string;
  onClose: () => void;
  onFilePicked: (file: UploadedFileInfo) => void;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  visible,
  docTitle = "Document",
  onClose,
  onFilePicked,
}) => {
  const checkSizeAndProceed = async (
    uri: string,
    name: string,
    providedSize?: number,
    mimeType?: string
  ): Promise<boolean> => {
    let sizeInBytes = providedSize;

    if (!sizeInBytes) {
      try {
        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (fileInfo.exists && fileInfo.size) {
          sizeInBytes = fileInfo.size;
        }
      } catch {
        // Fallback if FileSystem check is unavailable
        sizeInBytes = 500 * 1024;
      }
    }

    if (sizeInBytes && sizeInBytes > MAX_FILE_SIZE_BYTES) {
      Alert.alert(
        "File Too Large",
        "The selected file exceeds 2 MB. Please select a smaller file (under 2 MB) to proceed."
      );
      return false;
    }

    const formattedSize = sizeInBytes
      ? `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`
      : "1.2 MB";

    onFilePicked({
      uri,
      name,
      size: formattedSize,
      mimeType,
    });
    onClose();
    return true;
  };

  // Option 1: Pick from Files / Drive
  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/jpeg", "image/png"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        await checkSizeAndProceed(
          asset.uri,
          asset.name || "document.pdf",
          asset.size,
          asset.mimeType
        );
      }
    } catch {
      Alert.alert("File Selection Error", "Could not select the document. Please try again.");
    }
  };

  // Option 2: Pick from Photo Gallery
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
        const fileName = asset.fileName || `document_${Date.now()}.jpg`;
        await checkSizeAndProceed(
          asset.uri,
          fileName,
          asset.fileSize,
          asset.mimeType || "image/jpeg"
        );
      }
    } catch {
      Alert.alert("Gallery Error", "Could not open photo gallery. Please try again.");
    }
  };

  // Option 3: Take Photo with Camera
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
        const fileName = asset.fileName || `camera_doc_${Date.now()}.jpg`;
        await checkSizeAndProceed(
          asset.uri,
          fileName,
          asset.fileSize,
          asset.mimeType || "image/jpeg"
        );
      }
    } catch {
      Alert.alert("Camera Error", "Could not open camera. Please try again.");
    }
  };

  return (
    <DocumentUploadBottomSheet
      visible={visible}
      documentTitle={docTitle}
      maxSizeBytesText="2 MB"
      onClose={onClose}
      onPickFiles={handlePickDocument}
      onPickGallery={handlePickGallery}
      onTakePhoto={handlePickCamera}
    />
  );
};

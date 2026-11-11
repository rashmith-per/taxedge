import React from "react";
import { Alert } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import { MAX_FILE_SIZE_BYTES, FILE_TOO_LARGE_MESSAGE, isFileSizeValid } from "../../../utils/tdsValidation";
import { TdsDocumentItem, DocumentUploadPayload } from "../../../types/tdsDocuments.types";
import { SharedItrDocumentCard } from "@/modules/itr/components/documents/SharedItrDocumentCard/SharedItrDocumentCard";

interface TdsDocumentCardProps {
  item: TdsDocumentItem;
  onUploadSuccess: (id: string, payload: DocumentUploadPayload) => void;
  onUploadError: (id: string, errorMessage: string) => void;
  onRemove: (id: string) => void;
}

export const TdsDocumentCard: React.FC<TdsDocumentCardProps & { variant?: "default" | "inline" }> = ({
  item,
  variant = "default",
  onUploadSuccess,
  onUploadError, // Note: SharedItrDocumentCard handles its own internal upload error via Alert, but we map the rest
  onRemove,
}) => {
  return (
    <SharedItrDocumentCard
      variant={variant}
      item={{
        id: item.id,
        title: item.title,
        subtitle: item.subtitle,
        isMandatory: item.isMandatory,
        status: item.status,
        fileUri: item.fileUri,
        fileName: item.fileName,
        fileSize: item.fileSize,
        mimeType: item.mimeType,
        errorMessage: item.errorMessage,
        iconType: item.iconType,
      }}
      maxSizeBytes={MAX_FILE_SIZE_BYTES}
      onUploadSuccess={async (id, payload) => {
        // The shared card rejects files whose size the picker reports. Camera and gallery photos
        // can arrive without a size, so measure the real file before accepting it. A file over the
        // limit is never passed on, so it is neither saved to the draft nor uploaded.
        try {
          const info = await FileSystem.getInfoAsync(payload.uri);
          const actualBytes = info.exists ? (info as { size?: number }).size : undefined;
          if (!isFileSizeValid(actualBytes, MAX_FILE_SIZE_BYTES)) {
            Alert.alert("File Too Large", FILE_TOO_LARGE_MESSAGE);
            return;
          }
        } catch {
          // The size could not be read (some content:// URIs). The picker-side check still applied.
        }
        // Map the shared payload back to the TDS specific DocumentUploadPayload
        onUploadSuccess(id, {
          uri: payload.uri,
          name: payload.name,
          size: payload.size,
          mimeType: payload.mimeType,
          fileTypeLabel: payload.fileTypeLabel,
        });
      }}
      onRemove={onRemove}
    />
  );
};

export default TdsDocumentCard;

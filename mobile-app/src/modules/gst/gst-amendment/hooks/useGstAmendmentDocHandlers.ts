import { pickImageFromCamera } from "@/modules/gst/utils/imageUploadHelper";
import { pickDocumentFromDrive } from "@/shared/utils/driveDocumentUploader";
import { persistSupportingDocument } from "../utils/gstDocumentPersistence";
import { SupportingDoc } from "../types/gstAmendmentTypes";

export async function browseDocumentForSection(
  selectedSectionId: string,
  setSectionDocs: React.Dispatch<React.SetStateAction<Record<string, SupportingDoc | null>>>,
  clearError: (field: string) => void
): Promise<void> {
  const doc = await pickDocumentFromDrive({
    maxSizeBytes: 10 * 1024 * 1024,
  });
  if (doc) {
    const persisted = await persistSupportingDocument({
      uri: doc.uri,
      name: doc.name,
      size: doc.size,
      mimeType: doc.mimeType,
    });
    setSectionDocs((prev) => ({
      ...prev,
      [selectedSectionId]: persisted,
    }));
    clearError("supportingDoc");
  }
}

export async function scanDocumentForSection(
  selectedSectionId: string,
  setSectionDocs: React.Dispatch<React.SetStateAction<Record<string, SupportingDoc | null>>>,
  clearError: (field: string) => void
): Promise<void> {
  const uri = await pickImageFromCamera(false);
  if (uri) {
    const persisted = await persistSupportingDocument({
      uri,
      name: `Scan_${Date.now().toString().slice(-4)}.jpg`,
      size: "1.4 MB",
      mimeType: "image/jpeg",
    });
    setSectionDocs((prev) => ({
      ...prev,
      [selectedSectionId]: persisted,
    }));
    clearError("supportingDoc");
  }
}

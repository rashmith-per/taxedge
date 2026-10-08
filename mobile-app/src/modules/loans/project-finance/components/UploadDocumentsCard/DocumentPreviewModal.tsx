import React from "react";
import { DocumentPreviewModal as CanonicalPreviewModal } from "@/shared/components/documents/DocumentPreviewModal";
import type { DocumentUploadItem } from "../../data/step7Data";

export interface DocumentPreviewModalProps {
  document: DocumentUploadItem | null;
  visible: boolean;
  onClose: () => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = (props) => (
  <CanonicalPreviewModal {...props} variant="project-finance" />
);

export default DocumentPreviewModal;

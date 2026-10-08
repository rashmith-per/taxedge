import React from "react";
import { DocumentPreviewModal as CanonicalPreviewModal } from "@/shared/components/documents/DocumentPreviewModal";
import type { LoanDocumentItem } from "../../../types/loans.types";

export interface DocumentPreviewModalProps {
  visible: boolean;
  document: LoanDocumentItem | null;
  onClose: () => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = (props) => (
  <CanonicalPreviewModal {...props} variant="home-loan" />
);

export default DocumentPreviewModal;

import React from "react";
import { DocumentPreviewModal as CanonicalPreviewModal } from "@/shared/components/documents/DocumentPreviewModal";
import type { ItrDocumentItem } from "../../types/itrFiling.types";

export interface DocumentPreviewModalProps {
  visible: boolean;
  document: ItrDocumentItem | null;
  onClose: () => void;
  onChangeFile: (doc: ItrDocumentItem) => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = (props) => (
  <CanonicalPreviewModal {...props} variant="itr" />
);

export default DocumentPreviewModal;

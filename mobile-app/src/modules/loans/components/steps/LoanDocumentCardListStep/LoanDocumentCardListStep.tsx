import React from "react";
import { View, Text } from "react-native";
import { DocumentUploadBottomSheet } from "@/shared/components/DocumentUploadBottomSheet";
import { DocumentCard as TdsDocumentCard, type DocumentChecklistItem as TdsChecklistItem } from "@/shared/components/documents";
import type { LoanDocumentItem, LoanDocumentCategory } from "../../../types/loans.types";
import type { LoanDocuments } from "../../../hooks/useLoanDocuments";
import { DocumentPreviewModal } from "../../../components/DocumentPreviewModal";
import { styles } from "./LoanDocumentCardListStep.styles";

export interface LoanDocumentCardListStepProps {
  /** Sections in display order; empty sections are hidden. */
  categories: readonly LoanDocumentCategory[];
  /** Document checklist state from `useLoanDocuments`, owned by the screen. */
  loanDocuments: LoanDocuments;
}

const mapLoanDocToTdsChecklist = (doc: LoanDocumentItem): TdsChecklistItem => {
  const isUploaded = Boolean(doc.fileUri);
  return {
    id: doc.id,
    title: doc.name,
    subtitle: doc.subtitle,
    isMandatory: doc.required,
    status: isUploaded ? "uploaded" : "not_uploaded",
    fileName: doc.fileName || (isUploaded ? doc.name : undefined),
    fileSize: doc.fileSize,
    fileUri: doc.fileUri,
  };
};

export const LoanDocumentCardListStep: React.FC<LoanDocumentCardListStepProps> = ({
  categories,
  loanDocuments,
}) => {
  const { documents, openUpload, removeDocument, openPreview, uploadSheetProps, previewModalProps } =
    loanDocuments;

  const renderDocumentCard = (doc: LoanDocumentItem) => (
    <TdsDocumentCard
      key={doc.id}
      item={mapLoanDocToTdsChecklist(doc)}
      onUploadPress={() => openUpload(doc.id)}
      onChange={() => openUpload(doc.id)}
      onDelete={() => removeDocument(doc.id)}
      onView={() => openPreview(doc.id)}
    />
  );

  const renderCategorySection = (category: LoanDocumentCategory) => {
    const categoryDocs = documents.filter((d) => d.category === category);
    if (categoryDocs.length === 0) return null;

    return (
      <View key={category} style={styles.categoryContainer}>
        <Text style={styles.categoryHeader}>{category}</Text>
        {categoryDocs.map(renderDocumentCard)}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Categorized Document List */}
      {categories.map(renderCategorySection)}

      <DocumentUploadBottomSheet {...uploadSheetProps} />
      <DocumentPreviewModal {...previewModalProps} />
    </View>
  );
};

export default LoanDocumentCardListStep;

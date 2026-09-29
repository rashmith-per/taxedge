import React, { useState } from "react";
import { View, Text } from "react-native";
import {
  LoanDocumentItem,
  LoanDocumentCategory,
} from "../../../types/loans.types";
import {
  DocumentUploadModal,
  UploadedFileInfo,
} from "@/modules/itr/itr-filing/components/DocumentUploadModal/DocumentUploadModal";
import { DocumentPreviewModal } from "@/modules/itr/itr-filing/components/DocumentPreviewModal/DocumentPreviewModal";
import { TdsDocumentCard } from "@/modules/itr/tds/components/upload/TdsDocumentCard/TdsDocumentCard";
import { TdsChecklistItem } from "@/modules/itr/tds/types/checklist.types";
import { styles } from "./WorkingCapitalDocumentsStep.styles";

export interface WorkingCapitalDocumentsStepProps {
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

export const WorkingCapitalDocumentsStep: React.FC<WorkingCapitalDocumentsStepProps> = ({
  documents,
  onDocumentUploaded,
}) => {
  const [activeUploadDoc, setActiveUploadDoc] = useState<LoanDocumentItem | null>(null);
  const [previewDoc, setPreviewDoc] = useState<LoanDocumentItem | null>(null);

  const handleUploadClick = (doc: LoanDocumentItem) => {
    setActiveUploadDoc(doc);
  };

  const handleFilePicked = (file: UploadedFileInfo) => {
    if (!activeUploadDoc) return;
    onDocumentUploaded(activeUploadDoc.id, file.uri, file.name, file.size);
    setActiveUploadDoc(null);
  };

  return (
    <View style={styles.container}>
      {/* Categorized Document List */}
      {CATEGORIES.map((category) => {
        const categoryDocs = documents.filter((d) => d.category === category);
        if (categoryDocs.length === 0) return null;

        return (
          <View key={category} style={styles.categoryContainer}>
            <Text style={styles.categoryHeader}>{category}</Text>
            {categoryDocs.map((doc) => {
              const isUploaded = Boolean(doc.fileUri);

              const tdsItem: TdsChecklistItem = {
                id: doc.id,
                title: doc.name,
                subtitle: doc.subtitle,
                isMandatory: doc.required,
                status: isUploaded ? "uploaded" : "not_uploaded",
                fileName: doc.fileName || (isUploaded ? `${doc.name}.pdf` : undefined),
                fileSize: doc.fileSize || (isUploaded ? "< 2 MB" : undefined),
                fileUri: doc.fileUri,
              };

              return (
                <TdsDocumentCard
                  key={doc.id}
                  item={tdsItem}
                  onUploadPress={() => handleUploadClick(doc)}
                  onChange={() => handleUploadClick(doc)}
                  onDelete={() => onDocumentUploaded(doc.id, "", "", "")}
                  onView={() => setPreviewDoc(doc)}
                />
              );
            })}
          </View>
        );
      })}

      {/* Upload Modal */}
      {activeUploadDoc && (
        <DocumentUploadModal
          visible={Boolean(activeUploadDoc)}
          docTitle={activeUploadDoc.name}
          onFilePicked={handleFilePicked}
          onClose={() => setActiveUploadDoc(null)}
        />
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <DocumentPreviewModal
          visible={Boolean(previewDoc)}
          document={previewDoc as any}
          onClose={() => setPreviewDoc(null)}
          onChangeFile={(doc) => {
            setPreviewDoc(null);
            setActiveUploadDoc(doc as any);
          }}
        />
      )}
    </View>
  );
};

export default WorkingCapitalDocumentsStep;



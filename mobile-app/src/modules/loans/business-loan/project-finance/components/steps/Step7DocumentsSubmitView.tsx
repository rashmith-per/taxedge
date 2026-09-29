import React, { useState } from "react";
import { UploadDocumentsCard } from "../UploadDocumentsCard/UploadDocumentsCard";
import { ReviewApplicationCard } from "../ReviewApplicationCard/ReviewApplicationCard";
import { DeclarationCard } from "../DeclarationCard/DeclarationCard";
import { SubmitApplicationCard } from "../SubmitApplicationCard/SubmitApplicationCard";
import { DocumentUploadItem } from "../../data/step7Data";

interface Step7DocumentsSubmitViewProps {
  documents: DocumentUploadItem[];
  onUploadDocument: (
    id: string,
    file: { name: string; uri: string; size: string }
  ) => void;
  onDeleteDocument: (id: string) => void;
  onEditStep: (stepIndex: number) => void;
  agreeAccuracy: boolean;
  onToggleAgreeAccuracy: () => void;
  agreeVerification: boolean;
  onToggleAgreeVerification: () => void;
}

export const Step7DocumentsSubmitView: React.FC<
  Step7DocumentsSubmitViewProps
> = ({
  documents,
  onUploadDocument,
  onDeleteDocument,
  onEditStep,
  agreeAccuracy,
  onToggleAgreeAccuracy,
  agreeVerification,
  onToggleAgreeVerification,
}) => {
  const [expanded, setExpanded] = useState({
    docs: true,
    review: true,
    declaration: true,
  });

  return (
    <>
      <UploadDocumentsCard
        documents={documents}
        onUploadDocument={onUploadDocument}
        onDeleteDocument={onDeleteDocument}
        isExpanded={expanded.docs}
        onToggleExpand={() => setExpanded((p) => ({ ...p, docs: !p.docs }))}
      />

      <ReviewApplicationCard
        onEditStep={onEditStep}
        isExpanded={expanded.review}
        onToggleExpand={() =>
          setExpanded((p) => ({ ...p, review: !p.review }))
        }
      />

      <DeclarationCard
        agreeAccuracy={agreeAccuracy}
        onToggleAgreeAccuracy={onToggleAgreeAccuracy}
        agreeVerification={agreeVerification}
        onToggleAgreeVerification={onToggleAgreeVerification}
        isExpanded={expanded.declaration}
        onToggleExpand={() =>
          setExpanded((p) => ({ ...p, declaration: !p.declaration }))
        }
      />

      <SubmitApplicationCard />
    </>
  );
};

export default Step7DocumentsSubmitView;

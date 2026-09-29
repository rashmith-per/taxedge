import React, { useState } from "react";
import { ApplicantDetailsCard } from "../ApplicantDetailsCard/ApplicantDetailsCard";
import { RegisteredAddressCard } from "../RegisteredAddressCard/RegisteredAddressCard";
import { PromotersCard } from "../PromotersCard/PromotersCard";
import { ProjectClassificationCard } from "../ProjectClassificationCard/ProjectClassificationCard";
import {
  ApplicantDetailsForm,
  RegisteredAddressForm,
  PromoterSponsorItem,
  ProjectClassificationForm,
} from "../../types/projectFinance.types";

interface Step1ApplicantViewProps {
  applicantDetails: ApplicantDetailsForm;
  onApplicantChange: (field: keyof ApplicantDetailsForm, value: any) => void;
  registeredAddress: RegisteredAddressForm;
  onAddressChange: (field: keyof RegisteredAddressForm, value: any) => void;
  promoters: PromoterSponsorItem[];
  onAddPromoter: (item: PromoterSponsorItem) => void;
  onUpdatePromoter: (item: PromoterSponsorItem) => void;
  projectClassification: ProjectClassificationForm;
  onClassificationChange: (field: keyof ProjectClassificationForm, value: any) => void;
}

export const Step1ApplicantView: React.FC<Step1ApplicantViewProps> = ({
  applicantDetails,
  onApplicantChange,
  registeredAddress,
  onAddressChange,
  promoters,
  onAddPromoter,
  onUpdatePromoter,
  projectClassification,
  onClassificationChange,
}) => {
  const [expanded, setExpanded] = useState({
    applicant: true,
    address: true,
    promoters: true,
    classification: true,
  });

  return (
    <>
      <ApplicantDetailsCard
        data={applicantDetails}
        onChange={onApplicantChange}
        isExpanded={expanded.applicant}
        onToggleExpand={() =>
          setExpanded((p) => ({ ...p, applicant: !p.applicant }))
        }
      />
      <RegisteredAddressCard
        data={registeredAddress}
        onChange={onAddressChange}
        isExpanded={expanded.address}
        onToggleExpand={() =>
          setExpanded((p) => ({ ...p, address: !p.address }))
        }
      />
      <PromotersCard
        promoters={promoters}
        onAddPromoter={onAddPromoter}
        onUpdatePromoter={onUpdatePromoter}
        isExpanded={expanded.promoters}
        onToggleExpand={() =>
          setExpanded((p) => ({ ...p, promoters: !p.promoters }))
        }
      />
      <ProjectClassificationCard
        data={projectClassification}
        onChange={onClassificationChange}
        isExpanded={expanded.classification}
        onToggleExpand={() =>
          setExpanded((p) => ({ ...p, classification: !p.classification }))
        }
      />
    </>
  );
};

export default Step1ApplicantView;

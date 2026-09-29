import React, { useState } from "react";
import { SecurityCollateralCard } from "../SecurityCollateralCard/SecurityCollateralCard";
import { LegalApprovalsCard } from "../LegalApprovalsCard/LegalApprovalsCard";
import { RegulatoryComplianceCard } from "../RegulatoryComplianceCard/RegulatoryComplianceCard";
import { InsuranceDetailsCard } from "../InsuranceDetailsCard/InsuranceDetailsCard";
import { OtherComplianceCard } from "../OtherComplianceCard/OtherComplianceCard";
import {
  SecurityCollateralItem,
  LegalApprovalsForm,
  RegulatoryComplianceForm,
  InsuranceDetailsForm,
  OtherComplianceForm,
} from "../../types/projectFinance.types";

interface Step6SecurityComplianceViewProps {
  securities: SecurityCollateralItem[];
  onAddSecurity: () => void;
  onUpdateSecurity: (
    id: string,
    field: keyof SecurityCollateralItem,
    value: any
  ) => void;
  onDeleteSecurity: (id: string) => void;
  legalApprovals: LegalApprovalsForm;
  onLegalApprovalsChange: (field: keyof LegalApprovalsForm, value: any) => void;
  regulatoryCompliance: RegulatoryComplianceForm;
  onRegulatoryChange: (
    field: keyof RegulatoryComplianceForm,
    value: any
  ) => void;
  insuranceDetails: InsuranceDetailsForm;
  onInsuranceChange: (field: keyof InsuranceDetailsForm, value: string) => void;
  otherCompliance: OtherComplianceForm;
  onOtherComplianceChange: (
    field: keyof OtherComplianceForm,
    value: any
  ) => void;
}

export const Step6SecurityComplianceView: React.FC<
  Step6SecurityComplianceViewProps
> = ({
  securities,
  onAddSecurity,
  onUpdateSecurity,
  onDeleteSecurity,
  legalApprovals,
  onLegalApprovalsChange,
  regulatoryCompliance,
  onRegulatoryChange,
  insuranceDetails,
  onInsuranceChange,
  otherCompliance,
  onOtherComplianceChange,
}) => {
  const [expanded, setExpanded] = useState({
    security: true,
    approvals: true,
    regulatory: true,
    insurance: true,
    other: true,
  });

  return (
    <>
      <SecurityCollateralCard
        securities={securities}
        onAddSecurity={onAddSecurity}
        onUpdateSecurity={onUpdateSecurity}
        onDeleteSecurity={onDeleteSecurity}
        isExpanded={expanded.security}
        onToggleExpand={() =>
          setExpanded((p) => ({ ...p, security: !p.security }))
        }
      />

      <LegalApprovalsCard
        data={legalApprovals}
        onChange={onLegalApprovalsChange}
        isExpanded={expanded.approvals}
        onToggleExpand={() =>
          setExpanded((p) => ({ ...p, approvals: !p.approvals }))
        }
      />

      <RegulatoryComplianceCard
        data={regulatoryCompliance}
        onChange={onRegulatoryChange}
        isExpanded={expanded.regulatory}
        onToggleExpand={() =>
          setExpanded((p) => ({ ...p, regulatory: !p.regulatory }))
        }
      />

      <InsuranceDetailsCard
        data={insuranceDetails}
        onChange={onInsuranceChange}
        isExpanded={expanded.insurance}
        onToggleExpand={() =>
          setExpanded((p) => ({ ...p, insurance: !p.insurance }))
        }
      />

      <OtherComplianceCard
        data={otherCompliance}
        onChange={onOtherComplianceChange}
        isExpanded={expanded.other}
        onToggleExpand={() => setExpanded((p) => ({ ...p, other: !p.other }))}
      />
    </>
  );
};

export default Step6SecurityComplianceView;

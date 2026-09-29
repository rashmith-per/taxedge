import React, { useState, useMemo } from "react";
import { LoanRequirementCard } from "../LoanRequirementCard/LoanRequirementCard";
import { RepaymentDetailsCard } from "../RepaymentDetailsCard/RepaymentDetailsCard";
import { RepaymentScheduleCard } from "../RepaymentScheduleCard/RepaymentScheduleCard";
import { RepaymentSourcesCard } from "../RepaymentSourcesCard/RepaymentSourcesCard";
import { SensitivityRiskCard } from "../SensitivityRiskCard/SensitivityRiskCard";
import {
  LoanRequirementForm,
  RepaymentDetailsForm,
  RepaymentScheduleRow,
  RepaymentSourcesForm,
  SensitivityRiskForm,
} from "../../types/projectFinance.types";
import {
  calculateRepaymentSchedule,
  calculateAutoDSCR,
} from "../../utils/loanCalculations";

export interface Step5LoanRequirementViewProps {
  loanRequirement: LoanRequirementForm;
  onRequirementChange: (field: keyof LoanRequirementForm, value: any) => void;
  repaymentDetails: RepaymentDetailsForm;
  onRepaymentChange: (field: keyof RepaymentDetailsForm, value: any) => void;
  repaymentSchedule: RepaymentScheduleRow[];
  repaymentSources: RepaymentSourcesForm;
  onSourcesChange: (field: keyof RepaymentSourcesForm, value: any) => void;
  sensitivityRisk: SensitivityRiskForm;
  onRiskChange: (field: keyof SensitivityRiskForm, value: string) => void;
  totalProjectCostFromScreen3?: string;
  ownContributionFromScreen3?: string;
}

export const Step5LoanRequirementView: React.FC<Step5LoanRequirementViewProps> = ({
  loanRequirement,
  onRequirementChange,
  repaymentDetails,
  onRepaymentChange,
  repaymentSources,
  onSourcesChange,
  sensitivityRisk,
  onRiskChange,
  totalProjectCostFromScreen3,
  ownContributionFromScreen3,
}) => {
  // Collapsed by default for Sensitivity & Risk as per requirement
  const [expanded, setExpanded] = useState({
    requirement: true,
    repayment: true,
    schedule: true,
    sources: true,
    risk: false,
  });

  // Screen 3 connected data
  const effectiveTotalCost =
    totalProjectCostFromScreen3?.trim() ||
    loanRequirement.totalProjectCost ||
    "";

  const effectiveOwnContribution =
    ownContributionFromScreen3?.trim() ||
    loanRequirement.ownContribution ||
    "";

  const effectiveLoanRequired = loanRequirement.loanRequired || "";

  const effectiveLoanRequirement = useMemo(
    () => ({
      ...loanRequirement,
      totalProjectCost: effectiveTotalCost,
      ownContribution: effectiveOwnContribution,
      loanRequired: effectiveLoanRequired,
    }),
    [loanRequirement, effectiveTotalCost, effectiveOwnContribution, effectiveLoanRequired]
  );

  // Auto-calculated amortization schedule & EMI
  const { schedule: dynamicSchedule, calculatedEmi } = useMemo(() => {
    return calculateRepaymentSchedule(
      effectiveLoanRequired,
      repaymentDetails.expectedInterestRate,
      repaymentDetails.repaymentPeriodYears
    );
  }, [
    effectiveLoanRequired,
    repaymentDetails.expectedInterestRate,
    repaymentDetails.repaymentPeriodYears,
  ]);

  // Auto-calculated DSCR
  const autoCalculatedDscr = useMemo(() => {
    return calculateAutoDSCR();
  }, []);

  return (
    <>
      <LoanRequirementCard
        data={effectiveLoanRequirement}
        onChange={onRequirementChange}
        isExpanded={expanded.requirement}
        onToggleExpand={() =>
          setExpanded((p) => ({ ...p, requirement: !p.requirement }))
        }
      />

      <RepaymentDetailsCard
        data={repaymentDetails}
        onChange={onRepaymentChange}
        isExpanded={expanded.repayment}
        onToggleExpand={() =>
          setExpanded((p) => ({ ...p, repayment: !p.repayment }))
        }
        calculatedEmi={calculatedEmi}
      />

      <RepaymentScheduleCard
        schedule={dynamicSchedule}
        loanAmount={effectiveLoanRequired}
        interestRate={repaymentDetails.expectedInterestRate || "10.5"}
        tenureYears={repaymentDetails.repaymentPeriodYears || "5 Years"}
        emi={repaymentDetails.preferredEmi || calculatedEmi}
        isExpanded={expanded.schedule}
        onToggleExpand={() =>
          setExpanded((p) => ({ ...p, schedule: !p.schedule }))
        }
      />

      <RepaymentSourcesCard
        data={repaymentSources}
        onChange={onSourcesChange}
        isExpanded={expanded.sources}
        onToggleExpand={() =>
          setExpanded((p) => ({ ...p, sources: !p.sources }))
        }
        autoCalculatedDscr={autoCalculatedDscr}
      />

      <SensitivityRiskCard
        data={sensitivityRisk}
        onChange={onRiskChange}
        isExpanded={expanded.risk}
        onToggleExpand={() => setExpanded((p) => ({ ...p, risk: !p.risk }))}
      />
    </>
  );
};

export default Step5LoanRequirementView;

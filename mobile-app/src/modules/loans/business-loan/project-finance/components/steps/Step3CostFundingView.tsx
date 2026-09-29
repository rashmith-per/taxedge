import React, { useState } from "react";
import { ProjectCostCard } from "../ProjectCostCard/ProjectCostCard";
import { MeansOfFinanceCard } from "../MeansOfFinanceCard/MeansOfFinanceCard";
import { DisbursementScheduleCard } from "../DisbursementScheduleCard/DisbursementScheduleCard";
import {
  ProjectCostForm,
  MeansOfFinanceForm,
  DisbursementScheduleForm,
} from "../../types/projectFinance.types";

interface Step3CostFundingViewProps {
  projectCost: ProjectCostForm;
  onCostChange: (field: keyof ProjectCostForm, value: any) => void;
  meansOfFinance: MeansOfFinanceForm;
  onMeansChange: (field: keyof MeansOfFinanceForm, value: any) => void;
  disbursementSchedule: DisbursementScheduleForm;
  onScheduleChange: (field: keyof DisbursementScheduleForm, value: any) => void;
}

export const Step3CostFundingView: React.FC<Step3CostFundingViewProps> = ({
  projectCost,
  onCostChange,
  meansOfFinance,
  onMeansChange,
  disbursementSchedule,
  onScheduleChange,
}) => {
  const [expanded, setExpanded] = useState({
    cost: true,
    means: true,
    schedule: true,
  });

  return (
    <>
      <ProjectCostCard
        data={projectCost}
        onChange={onCostChange}
        isExpanded={expanded.cost}
        onToggleExpand={() => setExpanded((p) => ({ ...p, cost: !p.cost }))}
      />
      <MeansOfFinanceCard
        data={meansOfFinance}
        onChange={onMeansChange}
        isExpanded={expanded.means}
        onToggleExpand={() => setExpanded((p) => ({ ...p, means: !p.means }))}
      />
      <DisbursementScheduleCard
        data={disbursementSchedule}
        onChange={onScheduleChange}
        isExpanded={expanded.schedule}
        onToggleExpand={() =>
          setExpanded((p) => ({ ...p, schedule: !p.schedule }))
        }
      />
    </>
  );
};

export default Step3CostFundingView;

import React, { useState } from "react";
import { ProductsServicesCard } from "../ProductsServicesCard/ProductsServicesCard";
import { MarketDetailsCard } from "../MarketDetailsCard/MarketDetailsCard";
import { CustomersOfftakersCard } from "../CustomersOfftakersCard/CustomersOfftakersCard";
import { ProjectionSetupCard } from "../ProjectionSetupCard/ProjectionSetupCard";
import { HistoricalFinancialsCard } from "../HistoricalFinancialsCard/HistoricalFinancialsCard";
import { ProjectedFinancialsCard } from "../ProjectedFinancialsCard/ProjectedFinancialsCard";
import { CashFlowCard } from "../CashFlowCard/CashFlowCard";
import { WorkingCapitalCard } from "../WorkingCapitalCard/WorkingCapitalCard";
import { DebtServiceDscrCard } from "../DebtServiceDscrCard/DebtServiceDscrCard";
import { FinancialRatiosCard } from "../FinancialRatiosCard/FinancialRatiosCard";
import { SensitivityAnalysisCard } from "../SensitivityAnalysisCard/SensitivityAnalysisCard";
import { MarketDetailsForm } from "../../types/projectFinance.types";
import {
  ProductItemV2,
  CustomerItemV2,
  ProjectionSetupForm,
  HistoricalFinancialsForm,
  FiveYearRow,
  WorkingCapitalForm,
  SensitivityScenarioRow,
} from "../../types/step4Types";

export interface Step4MarketFinancialsViewProps {
  products: ProductItemV2[];
  onAddProduct: () => void;
  onUpdateProduct: (id: string, field: keyof ProductItemV2, value: string) => void;
  onDeleteProduct: (id: string) => void;
  marketDetails: MarketDetailsForm;
  onMarketChange: (field: keyof MarketDetailsForm, value: any) => void;
  customers: CustomerItemV2[];
  onAddCustomer: () => void;
  onUpdateCustomer: (id: string, field: keyof CustomerItemV2, value: any) => void;
  onDeleteCustomer: (id: string) => void;
  projectionSetup: ProjectionSetupForm;
  onProjectionSetupChange: (field: keyof ProjectionSetupForm, value: string) => void;
  historicalFinancials: HistoricalFinancialsForm;
  onHistoricalChange: (
    row: keyof HistoricalFinancialsForm,
    field: "fy3" | "fy2" | "fy1",
    value: string
  ) => void;
  projectedFinancials: FiveYearRow[];
  cashFlow: FiveYearRow[];
  workingCapital: WorkingCapitalForm;
  onWorkingCapitalChange: (field: keyof WorkingCapitalForm, value: string) => void;
  debtServiceDscr: FiveYearRow[];
  financialRatios: FiveYearRow[];
  sensitivityScenarios: SensitivityScenarioRow[];
}

export const Step4MarketFinancialsView: React.FC<Step4MarketFinancialsViewProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  marketDetails,
  onMarketChange,
  customers,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  projectionSetup,
  onProjectionSetupChange,
  historicalFinancials,
  onHistoricalChange,
  projectedFinancials,
  cashFlow,
  workingCapital,
  onWorkingCapitalChange,
  debtServiceDscr,
  financialRatios,
  sensitivityScenarios,
}) => {
  const [expanded, setExpanded] = useState({
    products: true,
    market: true,
    customers: true,
  });

  return (
    <>
      <ProductsServicesCard
        products={products}
        onAddProduct={onAddProduct}
        onUpdateProduct={onUpdateProduct}
        onDeleteProduct={onDeleteProduct}
        isExpanded={expanded.products}
        onToggleExpand={() =>
          setExpanded((p) => ({ ...p, products: !p.products }))
        }
      />
      <MarketDetailsCard
        data={marketDetails}
        onChange={onMarketChange}
        isExpanded={expanded.market}
        onToggleExpand={() =>
          setExpanded((p) => ({ ...p, market: !p.market }))
        }
      />
      <CustomersOfftakersCard
        customers={customers}
        onAddCustomer={onAddCustomer}
        onUpdateCustomer={onUpdateCustomer}
        onDeleteCustomer={onDeleteCustomer}
        isExpanded={expanded.customers}
        onToggleExpand={() =>
          setExpanded((p) => ({ ...p, customers: !p.customers }))
        }
      />
      <ProjectionSetupCard
        data={projectionSetup}
        onChange={onProjectionSetupChange}
      />
      <HistoricalFinancialsCard
        data={historicalFinancials}
        onChange={onHistoricalChange}
      />
      <ProjectedFinancialsCard rows={projectedFinancials} />
      <CashFlowCard rows={cashFlow} />
      <WorkingCapitalCard
        data={workingCapital}
        onChange={onWorkingCapitalChange}
      />
      <DebtServiceDscrCard rows={debtServiceDscr} />
      <FinancialRatiosCard rows={financialRatios} />
      <SensitivityAnalysisCard scenarios={sensitivityScenarios} />
    </>
  );
};

export default Step4MarketFinancialsView;

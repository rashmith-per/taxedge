import {
  ProjectCostForm,
  MeansOfFinanceForm,
  DisbursementScheduleForm,
  MarketDetailsForm,
} from "../types/projectFinance.types";
import {
  ProductItemV2,
  CustomerItemV2,
  ProjectionSetupForm,
  WorkingCapitalForm,
} from "../types/step4Types";

export interface Step3ValidationState {
  projectCost: ProjectCostForm;
  meansOfFinance: MeansOfFinanceForm;
  disbursementSchedule: DisbursementScheduleForm;
}

export interface Step4ValidationState {
  products: ProductItemV2[];
  marketDetails: MarketDetailsForm;
  customers: CustomerItemV2[];
  projectionSetup: ProjectionSetupForm;
  workingCapital: WorkingCapitalForm;
}

export const validateStep3 = (state: Step3ValidationState): string | null => {
  const { projectCost, meansOfFinance, disbursementSchedule } = state;

  // 1. Total Project Cost (Capex Breakup)
  if (!projectCost.landDevelopmentCost?.trim()) {
    return "Please enter Land & Site Development Cost.";
  }
  if (!projectCost.civilWorksCost?.trim()) {
    return "Please enter Civil Works & Building Construction Cost.";
  }
  if (!projectCost.plantMachineryCost?.trim()) {
    return "Please enter Plant & Machinery / Equipment Cost.";
  }
  if (!projectCost.engineeringKnowhowCost?.trim()) {
    return "Please enter Engineering & Technical Knowhow Cost.";
  }
  if (!projectCost.preliminaryExpenses?.trim()) {
    return "Please enter Preliminary & Pre-operative Expenses.";
  }
  if (!projectCost.workingCapitalMargin?.trim()) {
    return "Please enter Margin Money for Working Capital.";
  }
  if (!projectCost.totalProjectCost?.trim()) {
    return "Please enter Total Estimated Project Cost.";
  }

  // 2. Means of Finance (Funding Structure)
  if (!meansOfFinance.promotersEquity?.trim()) {
    return "Please enter Promoters Equity Contribution.";
  }
  if (!meansOfFinance.termLoanRequested?.trim()) {
    return "Please enter Debt / Term Loan Requested.";
  }
  if (!meansOfFinance.debtEquityRatio?.trim()) {
    return "Please enter Proposed Debt to Equity Ratio.";
  }

  // 3. Disbursement Schedule & Phasing
  if (!disbursementSchedule.phase1Amount?.trim()) {
    return "Please enter Phase 1 Drawdown / Investment Amount.";
  }
  if (!disbursementSchedule.phase1Milestone?.trim()) {
    return "Please enter Phase 1 Milestone.";
  }
  if (!disbursementSchedule.expectedCodDate?.trim()) {
    return "Please select Expected Commercial Operations Date (COD).";
  }

  return null;
};

export const validateStep4 = (state: Step4ValidationState): string | null => {
  const {
    products,
    marketDetails,
    customers,
    projectionSetup,
    workingCapital,
  } = state;

  // 1. Products / Services
  if (!products || products.length === 0) {
    return "Please add at least one Product / Service.";
  }
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const prefix = products.length > 1 ? `Product ${i + 1}: ` : "";
    if (!p.name?.trim()) {
      return `${prefix}Please enter Product / Service Name.`;
    }
    if (!p.category?.trim()) {
      return `${prefix}Please select Product Category.`;
    }
    if (!p.unit?.trim()) {
      return `${prefix}Please select Unit of Measurement.`;
    }
    if (!p.installedCapacity?.trim()) {
      return `${prefix}Please enter Installed Capacity.`;
    }
    if (!p.expectedProductionAnnual?.trim()) {
      return `${prefix}Please enter Expected Production (Annual).`;
    }
    if (!p.capacityUtilisation?.trim()) {
      return `${prefix}Please enter Capacity Utilisation (%).`;
    }
    if (!p.sellingPrice?.trim()) {
      return `${prefix}Please enter Selling Price.`;
    }
    if (!p.domesticExport?.trim()) {
      return `${prefix}Please select Domestic / Export.`;
    }
    if (!p.productMix?.trim()) {
      return `${prefix}Please enter Product Mix (%).`;
    }
  }

  // 2. Market Details
  if (!marketDetails.targetMarket?.trim()) {
    return "Please select Target Market.";
  }
  if (!marketDetails.marketType?.trim()) {
    return "Please select Market Type.";
  }
  if (!marketDetails.targetGeography?.trim()) {
    return "Please select Target Geography.";
  }
  if (!marketDetails.customerSegment?.trim()) {
    return "Please select Customer Segment.";
  }

  // 3. Customers / Offtakers
  if (!customers || customers.length === 0) {
    return "Please add at least one Customer / Offtaker.";
  }
  for (let i = 0; i < customers.length; i++) {
    const c = customers[i];
    const prefix = customers.length > 1 ? `Customer ${i + 1}: ` : "";
    if (!c.customerName?.trim()) {
      return `${prefix}Please enter Customer / Offtaker Name.`;
    }
    if (!c.customerType?.trim()) {
      return `${prefix}Please select Customer Type.`;
    }
    if (!c.expectedPurchaseQty?.trim()) {
      return `${prefix}Please enter Expected Purchase Quantity.`;
    }
    if (!c.unit?.trim()) {
      return `${prefix}Please select Unit.`;
    }
    if (!c.expectedRevenue?.trim()) {
      return `${prefix}Please enter Expected Revenue.`;
    }
  }

  // 4. Projection Setup
  if (!projectionSetup.projectionPeriodYears?.trim()) {
    return "Please select Projection Period (Years).";
  }
  if (!projectionSetup.historicalYears?.trim()) {
    return "Please select Historical Years.";
  }
  if (!projectionSetup.projectedYears?.trim()) {
    return "Please select Projected Years.";
  }
  if (!projectionSetup.commercialOperationDate?.trim()) {
    return "Please select Commercial Operation Date.";
  }

  // 5. Working Capital
  if (!workingCapital.inventoryDays?.trim()) {
    return "Please enter Inventory Days.";
  }
  if (!workingCapital.receivableDays?.trim()) {
    return "Please enter Receivable Days.";
  }
  if (!workingCapital.payableDays?.trim()) {
    return "Please enter Payable Days.";
  }

  return null;
};

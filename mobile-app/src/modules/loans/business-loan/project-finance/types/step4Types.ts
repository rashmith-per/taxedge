export interface ProductItemV2 {
  id: string;
  name: string;
  category: string;
  unit: string;
  installedCapacity: string;
  expectedProductionAnnual: string;
  capacityUtilisation: string;
  sellingPrice: string;
  domesticExport: string;
  productMix: string;
}

export interface CustomerItemV2 {
  id: string;
  customerName: string;
  customerType: string;
  expectedPurchaseQty: string;
  unit: string;
  expectedRevenue: string;
  contractAvailable: boolean;
  contractPeriodYears: string;
  contractedPrice: string;
  minimumOfftake: string;
  agreementStatus: string;
}

export interface ProjectionSetupForm {
  projectionPeriodYears: string;
  historicalYears: string;
  projectedYears: string;
  commercialOperationDate: string;
  stabilisationYear: string;
}

export interface HistoricalFinancialsForm {
  revenue: { fy3: string; fy2: string; fy1: string };
  ebitda: { fy3: string; fy2: string; fy1: string };
  pat: { fy3: string; fy2: string; fy1: string };
  existingDebt: { fy3: string; fy2: string; fy1: string };
}

export interface FiveYearRow {
  particulars: string;
  year1: string;
  year2: string;
  year3: string;
  year4: string;
  year5: string;
}

export interface WorkingCapitalForm {
  inventoryDays: string;
  receivableDays: string;
  payableDays: string;
  operatingCycleDays: string;
}

export interface SensitivityScenarioRow {
  scenario: string;
  dscr: string;
  irr: string;
  cashFlow: string;
}

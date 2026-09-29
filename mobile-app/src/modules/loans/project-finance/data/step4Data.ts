import { MarketDetailsForm } from "../types/projectFinance.types";
import {
  ProductItemV2,
  CustomerItemV2,
  ProjectionSetupForm,
  HistoricalFinancialsForm,
  FiveYearRow,
  WorkingCapitalForm,
  SensitivityScenarioRow,
} from "../types/step4Types";

export const INITIAL_MARKET_DETAILS: MarketDetailsForm = {
  targetMarket: "",
  marketType: "",
  targetGeography: "",
  customerSegment: "",
  expectedMarketShare: "",
  majorCompetitors: "",
  competitiveAdvantage: "",
};

export const PRODUCT_CATEGORIES = [
  "Industrial Manufacturing",
  "Consumer Products",
  "Raw Materials / Commodities",
  "Intermediates & Components",
  "Power / Energy",
  "Services",
  "Other",
];

export const PRODUCT_UNITS = [
  "MT / Annum",
  "Units / Year",
  "Litres / Year",
  "Kg / Year",
  "Pieces / Year",
  "MW / MWh",
  "Barrels / Year",
];

export const DOMESTIC_EXPORT_OPTIONS = [
  "Domestic",
  "Export",
  "Both (Domestic & Export)",
];

export const CUSTOMER_TYPES = [
  "Corporate / B2B",
  "Government / PSU",
  "Retail / B2C",
  "Institutional",
  "Distributor / Wholesaler",
];

export const AGREEMENT_STATUS_OPTIONS = [
  "Signed & Active",
  "Under Negotiation",
  "MOU Signed",
  "LOI Received",
  "Not Applicable",
];

export const PROJECTION_PERIOD_OPTIONS = [
  "5 Years",
  "7 Years",
  "10 Years",
  "12 Years",
  "15 Years",
];

export const HISTORICAL_YEARS_OPTIONS = [
  "3 Years",
  "2 Years",
  "1 Year",
  "Not Applicable (Greenfield)",
];

export const PROJECTED_YEARS_OPTIONS = [
  "5 Years",
  "7 Years",
  "10 Years",
];

export const STABILISATION_YEAR_OPTIONS = [
  "Year 1",
  "Year 2",
  "Year 3",
  "Year 4",
];

export const INITIAL_PRODUCTS_V2: ProductItemV2[] = [
  {
    id: "1",
    name: "",
    category: "",
    unit: "",
    installedCapacity: "",
    expectedProductionAnnual: "",
    capacityUtilisation: "",
    sellingPrice: "",
    domesticExport: "",
    productMix: "",
  },
];

export const INITIAL_CUSTOMERS_V2: CustomerItemV2[] = [
  {
    id: "1",
    customerName: "",
    customerType: "",
    expectedPurchaseQty: "",
    unit: "",
    expectedRevenue: "",
    contractAvailable: true,
    contractPeriodYears: "",
    contractedPrice: "",
    minimumOfftake: "",
    agreementStatus: "",
  },
];

export const INITIAL_PROJECTION_SETUP: ProjectionSetupForm = {
  projectionPeriodYears: "",
  historicalYears: "",
  projectedYears: "",
  commercialOperationDate: "",
  stabilisationYear: "",
};

export const INITIAL_HISTORICAL_FINANCIALS: HistoricalFinancialsForm = {
  revenue: { fy3: "", fy2: "", fy1: "" },
  ebitda: { fy3: "", fy2: "", fy1: "" },
  pat: { fy3: "", fy2: "", fy1: "" },
  existingDebt: { fy3: "", fy2: "", fy1: "" },
};

export const INITIAL_PROJECTED_FINANCIALS: FiveYearRow[] = [
  { particulars: "Revenue (₹)", year1: "–", year2: "–", year3: "–", year4: "–", year5: "–" },
  { particulars: "EBITDA (₹)", year1: "–", year2: "–", year3: "–", year4: "–", year5: "–" },
  { particulars: "EBITDA Margin (%)", year1: "–", year2: "–", year3: "–", year4: "–", year5: "–" },
  { particulars: "PAT (₹)", year1: "–", year2: "–", year3: "–", year4: "–", year5: "–" },
];

export const INITIAL_CASH_FLOW: FiveYearRow[] = [
  { particulars: "Operating Cash Flow (₹)", year1: "–", year2: "–", year3: "–", year4: "–", year5: "–" },
  { particulars: "Capex (₹)", year1: "–", year2: "–", year3: "–", year4: "–", year5: "–" },
  { particulars: "Principal Repayment (₹)", year1: "–", year2: "–", year3: "–", year4: "–", year5: "–" },
  { particulars: "Closing Cash Balance (₹)", year1: "–", year2: "–", year3: "–", year4: "–", year5: "–" },
];

export const INITIAL_WORKING_CAPITAL: WorkingCapitalForm = {
  inventoryDays: "",
  receivableDays: "",
  payableDays: "",
  operatingCycleDays: "",
};

export const INITIAL_DEBT_SERVICE_DSCR: FiveYearRow[] = [
  { particulars: "Opening Debt (₹)", year1: "–", year2: "–", year3: "–", year4: "–", year5: "–" },
  { particulars: "Interest (₹)", year1: "–", year2: "–", year3: "–", year4: "–", year5: "–" },
  { particulars: "Principal Repayment (₹)", year1: "–", year2: "–", year3: "–", year4: "–", year5: "–" },
  { particulars: "Closing Debt (₹)", year1: "–", year2: "–", year3: "–", year4: "–", year5: "–" },
  { particulars: "DSCR", year1: "–", year2: "–", year3: "–", year4: "–", year5: "–" },
  { particulars: "Minimum DSCR", year1: "–", year2: "–", year3: "–", year4: "–", year5: "–" },
];

export const INITIAL_FINANCIAL_RATIOS: FiveYearRow[] = [
  { particulars: "EBITDA Margin (%)", year1: "–", year2: "–", year3: "–", year4: "–", year5: "–" },
  { particulars: "PAT Margin (%)", year1: "–", year2: "–", year3: "–", year4: "–", year5: "–" },
  { particulars: "Debt / Equity", year1: "–", year2: "–", year3: "–", year4: "–", year5: "–" },
  { particulars: "Interest Coverage", year1: "–", year2: "–", year3: "–", year4: "–", year5: "–" },
  { particulars: "Project IRR (%)", year1: "–", year2: "–", year3: "–", year4: "–", year5: "–" },
  { particulars: "ROE (%)", year1: "–", year2: "–", year3: "–", year4: "–", year5: "–" },
  { particulars: "ROCE (%)", year1: "–", year2: "–", year3: "–", year4: "–", year5: "–" },
  { particulars: "Equity IRR (%)", year1: "–", year2: "–", year3: "–", year4: "–", year5: "–" },
  { particulars: "Break-even (Years)", year1: "–", year2: "–", year3: "–", year4: "–", year5: "–" },
  { particulars: "Payback Period (Years)", year1: "–", year2: "–", year3: "–", year4: "–", year5: "–" },
];

export const INITIAL_SENSITIVITY_SCENARIOS: SensitivityScenarioRow[] = [
  { scenario: "Base Case", dscr: "–", irr: "–", cashFlow: "–" },
  { scenario: "Revenue +10%", dscr: "–", irr: "–", cashFlow: "–" },
  { scenario: "Revenue -10%", dscr: "–", irr: "–", cashFlow: "–" },
  { scenario: "Price +10%", dscr: "–", irr: "–", cashFlow: "–" },
  { scenario: "Cost +10%", dscr: "–", irr: "–", cashFlow: "–" },
  { scenario: "DCCO Delay (6 Months)", dscr: "–", irr: "–", cashFlow: "–" },
];

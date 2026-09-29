export interface PromoterSponsorItem {
  id: string;
  name: string;
  type: "Individual" | "Corporate";
  sharePercentage: number;
  initials: string;
}

export interface ApplicantDetailsForm {
  applicantName: string;
  constitutionType: string;
  pan: string;
  cinLlpin: string;
  dateOfIncorporation: string;
  isExistingCustomer: boolean;
  bankingRelationship: string;
  primaryBusinessActivity: string;
}

export interface RegisteredAddressForm {
  addressLine1: string;
  addressLine2: string;
  state: string;
  districtCity: string;
  pinCode: string;
}

export interface ProjectClassificationForm {
  projectName: string;
  projectSector: string;
  projectSubSector: string;
  projectType: string;
  developmentCategory: string;
}

export interface ProjectLocationForm {
  projectAddress: string;
  state: string;
  district: string;
  pinCode: string;
  projectZone: string;
  nearestTown: string;
  distanceFromTown: string;
}

export interface LandDetailsForm {
  totalLandRequired: string;
  landAvailable: string;
  landAcquired: string;
  landPending: string;
  landOwnership: string;
  landUse: string;
  titleStatus: string;
  encumbrance: string;
  naConversionStatus: string;
}

export interface LandParcelItem {
  id: string;
  surveyPlotNumber: string;
  areaAcres: string;
  ownership: string;
  acquisitionStatus: string;
  titleStatus: string;
  encumbrance: string;
}

export interface RightOfWayForm {
  rowRequired: boolean;
  rowType: string;
  totalLengthKm: string;
  obtainedPendingStatus: string;
  approvalStatus: string;
  expectedCompletionDate: string;
}

export interface UtilitiesForm {
  powerSource: string;
  waterSource: string;
  approachRoad: string;
  drainageArrangement: string;
  wasteArrangement: string;
  otherInfrastructure: string;
}

export interface TechnicalDetailsForm {
  technologyType: string;
  technologyDescription: string;
  technologySource: string;
  technologyProvider: string;
  technologyProven: boolean;
  technologyLicenseRequired: boolean;
  technicalConsultant: string;
}

export interface ProjectCostForm {
  landDevelopmentCost: string;
  civilWorksCost: string;
  plantMachineryCost: string;
  engineeringKnowhowCost: string;
  preliminaryExpenses: string;
  workingCapitalMargin: string;
  contingencyMargin: string;
  totalProjectCost: string;
}

export interface MeansOfFinanceForm {
  promotersEquity: string;
  termLoanRequested: string;
  subordinatedDebt: string;
  govtGrantSubsidy: string;
  debtEquityRatio: string;
  proposedLenders: string;
}

export interface DisbursementScheduleForm {
  phase1Amount: string;
  phase1Milestone: string;
  phase2Amount: string;
  phase2Milestone: string;
  expectedCodDate: string;
}

export interface ProductServiceItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  installedCapacity: string;
  expectedProduction: string;
  capacityUtilisation: string;
  sellingPrice: string;
  domesticExport: string;
  productMix: string;
}

export interface MarketDetailsForm {
  targetMarket: string;
  marketType: string;
  targetGeography: string;
  customerSegment: string;
  expectedMarketShare: string;
  majorCompetitors: string;
  competitiveAdvantage: string;
}

export interface CustomerOfftakerItem {
  id: string;
  name: string;
  type: string;
  expectedQuantity: string;
  contractPeriodYears: string;
  estimatedRevenue: string;
  isOfftaker: boolean;
}

export interface RevenueProjectionYear {
  year: string;
  salesVolume: string;
  averagePrice: string;
  revenue: string;
}

export interface SensitivityAnalysisForm {
  scenario: string;
  volumeChangePercent: string;
  priceChangePercent: string;
  revenueImpactPercent: string;
}

// Step 5: Loan Requirement & Repayment Types
export interface LoanRequirementForm {
  totalProjectCost: string;
  ownContribution: string;
  loanRequired: string;
  typeOfLoan: string;
  schemeProduct: string;
  preferredLender: string;
  proposedDisbursementDate: string;
}

export interface RepaymentDetailsForm {
  repaymentPeriodYears: string;
  moratoriumPeriodMonths: string;
  repaymentFrequency: string;
  expectedInterestRate: string;
  repaymentStartDate: string;
  preferredEmi: string;
}

export interface RepaymentScheduleRow {
  year: string;
  openingBalance: string;
  principal: string;
  interest: string;
  totalPayment: string;
  closingBalance: string;
}

export interface RepaymentSourcesForm {
  primarySource: string;
  secondarySource: string;
  projectedDscr: string;
  explanation: string;
}

export interface SensitivityRiskForm {
  revenueDownside: string;
  costIncrease: string;
  interestRateIncrease: string;
}

// Step 6: Security & Compliance Types
export interface SecurityCollateralItem {
  id: string;
  typeOfSecurity: string;
  assetDescription: string;
  estimatedValue: string;
  ownershipType: string;
  locationOfAsset: string;
  valuationReportAvailable: boolean;
  anyExistingCharge: boolean;
  existingChargeDetails: string;
}

export interface LegalApprovalsForm {
  environmentalClearance: boolean;
  buildingPlanApproval: boolean;
  factoryLicense: boolean;
  pollutionControlBoard: boolean;
  landUseConversion: boolean;
  powerConnectionApproval: boolean;
  waterSupplyApproval: boolean;
  otherApproval: boolean;
  otherApprovalDetails?: string;
}

export interface RegulatoryComplianceForm {
  businessRegistrationType: string;
  registrationNumber: string;
  gstApplicable: boolean;
  gstNumber: string;
  panNumber: string;
  tanNumber: string;
}

export interface InsuranceDetailsForm {
  typeOfInsurance: string;
  coverageAmount: string;
  policyValidity: string;
}

export interface OtherComplianceForm {
  labourLawCompliance: boolean;
  localAuthorityApprovals: boolean;
  healthSafetyCompliance: boolean;
  industrySpecificCompliance: boolean;
  pendingLitigation: boolean;
  litigationDetails: string;
}

export * from "./step2Types";
export * from "./step4Types";




import { useState } from "react";
import {
  ApplicantDetailsForm,
  RegisteredAddressForm,
  PromoterSponsorItem,
  ProjectClassificationForm,
  ProjectLocationForm,
  LandDetailsForm,
  LandParcelItem,
  RightOfWayForm,
  UtilitiesForm,
  TechnicalDetailsForm,
  CapacityProductionForm,
  PlantMachineryItem,
  RawMaterialItem,
  EpcExecutionForm,
  ImplementationMilestoneItem,
  ManpowerForm,
  ProjectCostForm,
  MeansOfFinanceForm,
  DisbursementScheduleForm,
  MarketDetailsForm,
  LoanRequirementForm,
  RepaymentDetailsForm,
  RepaymentScheduleRow,
  RepaymentSourcesForm,
  SensitivityRiskForm,
  SecurityCollateralItem,
  LegalApprovalsForm,
  RegulatoryComplianceForm,
  InsuranceDetailsForm,
  OtherComplianceForm,
} from "../../types/projectFinance.types";
import {
  ProductItemV2,
  CustomerItemV2,
  ProjectionSetupForm,
  HistoricalFinancialsForm,
  FiveYearRow,
  WorkingCapitalForm,
  SensitivityScenarioRow,
} from "../../types/step4Types";
import { INITIAL_PROMOTERS } from "../../data/projectFinanceData";
import {
  INITIAL_CAPACITY_PRODUCTION,
  INITIAL_MACHINERIES,
  INITIAL_RAW_MATERIALS,
  INITIAL_EPC_EXECUTION,
  INITIAL_MILESTONES,
  INITIAL_MANPOWER,
} from "../../data/step2Data";
import {
  INITIAL_PRODUCTS_V2,
  INITIAL_MARKET_DETAILS,
  INITIAL_CUSTOMERS_V2,
  INITIAL_PROJECTION_SETUP,
  INITIAL_HISTORICAL_FINANCIALS,
  INITIAL_PROJECTED_FINANCIALS,
  INITIAL_CASH_FLOW,
  INITIAL_WORKING_CAPITAL,
  INITIAL_DEBT_SERVICE_DSCR,
  INITIAL_FINANCIAL_RATIOS,
  INITIAL_SENSITIVITY_SCENARIOS,
} from "../../data/step4Data";
import {
  INITIAL_SECURITIES,
  INITIAL_LEGAL_APPROVALS,
  INITIAL_REGULATORY_COMPLIANCE,
  INITIAL_INSURANCE_DETAILS,
  INITIAL_OTHER_COMPLIANCE,
} from "../../data/step6Data";
import {
  DocumentUploadItem,
  INITIAL_DOCUMENTS,
} from "../../data/step7Data";

export const useProjectFinanceState = () => {
  // Step 1
  const [applicantDetails, setApplicantDetails] = useState<ApplicantDetailsForm>({
    applicantName: "", constitutionType: "", pan: "", cinLlpin: "",
    dateOfIncorporation: "", isExistingCustomer: true, bankingRelationship: "", primaryBusinessActivity: "",
  });
  const [registeredAddress, setRegisteredAddress] = useState<RegisteredAddressForm>({
    addressLine1: "", addressLine2: "", state: "", districtCity: "", pinCode: "",
  });
  const [promoters, setPromoters] = useState<PromoterSponsorItem[]>(INITIAL_PROMOTERS);
  const [projectClassification, setProjectClassification] = useState<ProjectClassificationForm>({
    projectName: "", projectSector: "", projectSubSector: "", projectType: "", developmentCategory: "",
  });

  // Step 2
  const [projectLocation, setProjectLocation] = useState<ProjectLocationForm>({
    projectAddress: "", state: "", district: "", pinCode: "", projectZone: "", nearestTown: "", distanceFromTown: "",
  });
  const [landDetails, setLandDetails] = useState<LandDetailsForm>({
    totalLandRequired: "", landAvailable: "", landAcquired: "", landPending: "",
    landOwnership: "", landUse: "", titleStatus: "", encumbrance: "", naConversionStatus: "",
  });
  const [parcels, setParcels] = useState<LandParcelItem[]>([
    { id: "p1", surveyPlotNumber: "", areaAcres: "", ownership: "", acquisitionStatus: "", titleStatus: "", encumbrance: "" },
  ]);
  const [rightOfWay, setRightOfWay] = useState<RightOfWayForm>({
    rowRequired: true, rowType: "", totalLengthKm: "", obtainedPendingStatus: "", approvalStatus: "", expectedCompletionDate: "",
  });
  const [utilities, setUtilities] = useState<UtilitiesForm>({
    powerSource: "", waterSource: "", approachRoad: "", drainageArrangement: "", wasteArrangement: "", otherInfrastructure: "",
  });
  const [technicalDetails, setTechnicalDetails] = useState<TechnicalDetailsForm>({
    technologyType: "", technologyDescription: "", technologySource: "", technologyProvider: "",
    technologyProven: true, technologyLicenseRequired: true, technicalConsultant: "",
  });
  const [capacityProduction, setCapacityProduction] = useState<CapacityProductionForm>(INITIAL_CAPACITY_PRODUCTION);
  const [machineries, setMachineries] = useState<PlantMachineryItem[]>(INITIAL_MACHINERIES);
  const [rawMaterials, setRawMaterials] = useState<RawMaterialItem[]>(INITIAL_RAW_MATERIALS);
  const [epcExecution, setEpcExecution] = useState<EpcExecutionForm>(INITIAL_EPC_EXECUTION);
  const [milestones, setMilestones] = useState<ImplementationMilestoneItem[]>(INITIAL_MILESTONES);
  const [manpower, setManpower] = useState<ManpowerForm>(INITIAL_MANPOWER);

  // Step 3
  const [projectCost, setProjectCost] = useState<ProjectCostForm>({
    landDevelopmentCost: "", civilWorksCost: "", plantMachineryCost: "", engineeringKnowhowCost: "",
    preliminaryExpenses: "", workingCapitalMargin: "", contingencyMargin: "", totalProjectCost: "",
  });
  const [meansOfFinance, setMeansOfFinance] = useState<MeansOfFinanceForm>({
    promotersEquity: "", termLoanRequested: "", subordinatedDebt: "",
    govtGrantSubsidy: "", debtEquityRatio: "", proposedLenders: "",
  });
  const [disbursementSchedule, setDisbursementSchedule] = useState<DisbursementScheduleForm>({
    phase1Amount: "", phase1Milestone: "", phase2Amount: "", phase2Milestone: "", expectedCodDate: "",
  });

  // Step 4
  const [products, setProducts] = useState<ProductItemV2[]>(INITIAL_PRODUCTS_V2);
  const [marketDetails, setMarketDetails] = useState<MarketDetailsForm>(INITIAL_MARKET_DETAILS);
  const [customers, setCustomers] = useState<CustomerItemV2[]>(INITIAL_CUSTOMERS_V2);
  const [projectionSetup, setProjectionSetup] = useState<ProjectionSetupForm>(INITIAL_PROJECTION_SETUP);
  const [historicalFinancials, setHistoricalFinancials] = useState<HistoricalFinancialsForm>(INITIAL_HISTORICAL_FINANCIALS);
  const [projectedFinancials, setProjectedFinancials] = useState<FiveYearRow[]>(INITIAL_PROJECTED_FINANCIALS);
  const [cashFlow, setCashFlow] = useState<FiveYearRow[]>(INITIAL_CASH_FLOW);
  const [workingCapital, setWorkingCapital] = useState<WorkingCapitalForm>(INITIAL_WORKING_CAPITAL);
  const [debtServiceDscr, setDebtServiceDscr] = useState<FiveYearRow[]>(INITIAL_DEBT_SERVICE_DSCR);
  const [financialRatios, setFinancialRatios] = useState<FiveYearRow[]>(INITIAL_FINANCIAL_RATIOS);
  const [sensitivityScenarios, setSensitivityScenarios] = useState<SensitivityScenarioRow[]>(INITIAL_SENSITIVITY_SCENARIOS);

  // Step 5
  const [loanRequirement, setLoanRequirement] = useState<LoanRequirementForm>({
    totalProjectCost: "", ownContribution: "", loanRequired: "",
    typeOfLoan: "", schemeProduct: "", preferredLender: "", proposedDisbursementDate: "",
  });
  const [repaymentDetails, setRepaymentDetails] = useState<RepaymentDetailsForm>({
    repaymentPeriodYears: "", moratoriumPeriodMonths: "", repaymentFrequency: "",
    expectedInterestRate: "", repaymentStartDate: "", preferredEmi: "",
  });
  const [repaymentSchedule] = useState<RepaymentScheduleRow[]>([]);
  const [repaymentSources, setRepaymentSources] = useState<RepaymentSourcesForm>({
    primarySource: "", secondarySource: "", projectedDscr: "", explanation: "",
  });
  const [sensitivityRisk, setSensitivityRisk] = useState<SensitivityRiskForm>({
    revenueDownside: "", costIncrease: "", interestRateIncrease: "",
  });

  // Step 6
  const [securities, setSecurities] = useState<SecurityCollateralItem[]>(INITIAL_SECURITIES);
  const [legalApprovals, setLegalApprovals] = useState<LegalApprovalsForm>(INITIAL_LEGAL_APPROVALS);
  const [regulatoryCompliance, setRegulatoryCompliance] = useState<RegulatoryComplianceForm>(INITIAL_REGULATORY_COMPLIANCE);
  const [insuranceDetails, setInsuranceDetails] = useState<InsuranceDetailsForm>(INITIAL_INSURANCE_DETAILS);
  const [otherCompliance, setOtherCompliance] = useState<OtherComplianceForm>(INITIAL_OTHER_COMPLIANCE);

  // Step 7
  const [documents, setDocuments] = useState<DocumentUploadItem[]>(INITIAL_DOCUMENTS);
  const [agreeAccuracy, setAgreeAccuracy] = useState(false);
  const [agreeVerification, setAgreeVerification] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  return {
    applicantDetails, setApplicantDetails,
    registeredAddress, setRegisteredAddress,
    promoters, setPromoters,
    projectClassification, setProjectClassification,
    projectLocation, setProjectLocation,
    landDetails, setLandDetails,
    parcels, setParcels,
    rightOfWay, setRightOfWay,
    utilities, setUtilities,
    technicalDetails, setTechnicalDetails,
    capacityProduction, setCapacityProduction,
    machineries, setMachineries,
    rawMaterials, setRawMaterials,
    epcExecution, setEpcExecution,
    milestones, setMilestones,
    manpower, setManpower,
    projectCost, setProjectCost,
    meansOfFinance, setMeansOfFinance,
    disbursementSchedule, setDisbursementSchedule,
    products, setProducts,
    marketDetails, setMarketDetails,
    customers, setCustomers,
    projectionSetup, setProjectionSetup,
    historicalFinancials, setHistoricalFinancials,
    projectedFinancials, setProjectedFinancials,
    cashFlow, setCashFlow,
    workingCapital, setWorkingCapital,
    debtServiceDscr, setDebtServiceDscr,
    financialRatios, setFinancialRatios,
    sensitivityScenarios, setSensitivityScenarios,
    loanRequirement, setLoanRequirement,
    repaymentDetails, setRepaymentDetails,
    repaymentSchedule,
    repaymentSources, setRepaymentSources,
    sensitivityRisk, setSensitivityRisk,
    securities, setSecurities,
    legalApprovals, setLegalApprovals,
    regulatoryCompliance, setRegulatoryCompliance,
    insuranceDetails, setInsuranceDetails,
    otherCompliance, setOtherCompliance,
    documents, setDocuments,
    agreeAccuracy, setAgreeAccuracy,
    agreeVerification, setAgreeVerification,
    showSuccessModal, setShowSuccessModal,
  };
};

export default useProjectFinanceState;

import { useAuthStore } from "@/store/authStore";
import { useApplicationStore } from "@/store/applicationStore";
import { ItrFilingFormData, ItrPersonalInfo, ItrSelectableBank, ItrBankDetails, ItrPriorFilingAndNotice, GstReconciliationSummary, ItrCategoryType, ItrStructuredDeductions, TaxesPaidDetails } from "../itr-filing/types/itrFiling.types";
import { getCurrentAssessmentYear } from "../taxRules";
import { calculateItrTax } from "../itr-filing/engine/itrTaxCalculator";
import { determineApplicableItrForm } from "../itr-filing/engine/itrFormEngine";
import { generateDynamicDocumentChecklist } from "../itr-filing/engine/itrDocumentEngine";

export const getInitialFormData = (): ItrFilingFormData => {
  // 1. Pull user profile from authStore
  const authState = useAuthStore.getState();
  const customer = authState.customer;
  const user = authState.authenticatedUser;

  // 2. Pull GST draft data if available from applicationStore
  const gstDraft = useApplicationStore.getState().gstDraft;
  const gstBusiness = gstDraft?.businessData || {};

  const personalInfo: ItrPersonalInfo = {
    pan: customer?.pan || user?.pan || "",
    aadhaar: customer?.aadhaar || user?.aadhaar || "",
    name: customer?.name || user?.name || "",
    dob: customer?.dob || user?.dob || "",
    gender: customer?.gender || user?.gender || "Male",
    fatherSpouseName: customer?.fatherSpouseName || "",
    address: customer?.address || customer?.addressLine1 || user?.address || "",
    city: customer?.city || user?.city || "",
    state: customer?.state || user?.state || "",
    pincode: customer?.pincode || user?.pincode || "",
    mobile: customer?.mobile || user?.mobileNumber || "",
    email: customer?.email || user?.email || "",
    residentialStatus: "Resident",
    residentialStatusConfirmed: true,
    assessmentYear: getCurrentAssessmentYear(),
    filingType: "139_1_original",
    filingTypeSuggested: "139_1_original",
    isAutoVerified: Boolean(customer?.pan || user?.pan),
  };

  const initialBankAccounts: ItrSelectableBank[] = [];

  const bankDetails: ItrBankDetails = {
    bankName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
    accountType: "Savings",
    isPrimaryRefund: false,
    validationStatus: "Pending",
  };

  const priorItrNotice: ItrPriorFilingAndNotice = {
    hasPreviousItr: false,
    previousAckNumber: "",
    previousAssessmentYear: "",
    previousItrForm: undefined,
    previousFiledDate: "",
    importedIncomeDetails: false,
    importedDeductions: false,
    importedLosses: false,
    importedBankDetails: false,
    importedFilingDetails: false,
    hasCarriedForwardLosses: false,
    carriedForwardLossesDetails: "",
    hasTaxNotice: false,
    noticeSection: "",
    noticeDetails: "",
  };

  const hasGst = Boolean(gstBusiness.gstin || gstBusiness.businessName);

  const gstReconciliation: GstReconciliationSummary = {
    gstin: gstBusiness.gstin || "",
    legalName: gstBusiness.businessName || "",
    tradeName: gstBusiness.tradeName || "",
    businessActivity: "",
    registrationDate: "",
    gstr1Turnover: Number(gstBusiness.annualTurnover || 0),
    gstr3bTurnover: Number(gstBusiness.annualTurnover || 0),
    booksTurnover: Number(gstBusiness.annualTurnover || 0),
    proposedItrTurnover: Number(gstBusiness.annualTurnover || 0),
    variance: 0,
    hasVariance: false,
    varianceExplanation: "",
  };

  const registeredAccountType = customer?.customerType || "Individual";
  const isCorporate =
    registeredAccountType === "Private Limited" ||
    registeredAccountType === "Public Limited" ||
    registeredAccountType === "LLP" ||
    registeredAccountType === "Partnership";
  let initialCategory: ItrCategoryType = (isCorporate ? "business" : "salaried") as ItrCategoryType;

  const incomeSources = {
    salary: {
      enabled: initialCategory === "salaried",
      employerName: "",
      grossSalary: "",
      allowances: "",
      tdsDeducted: "",
      source: "USER_DECLARED" as const,
      isVerified: false,
    },
    houseProperty: {
      enabled: initialCategory === "rental",
      propertyType: "self_occupied" as const,
      annualRentReceived: "",
      municipalTaxesPaid: "",
      homeLoanInterest: "",
      source: "USER_DECLARED" as const,
    },
    business: {
      enabled: initialCategory === "business" || initialCategory === "professional" || initialCategory === "freelancer",
      businessType: "presumptive_44ad" as const,
      businessName: gstBusiness.businessName || "",
      gstin: gstBusiness.gstin || "",
      businessActivity: "",
      grossTurnover: gstBusiness.annualTurnover ? String(gstBusiness.annualTurnover) : "",
      declaredProfit: "",
      source: hasGst ? ("GST_FILING" as const) : ("USER_DECLARED" as const),
      hasGstActivity: hasGst,
      gstr1Turnover: "",
      gstr3bTurnover: "",
      gstReconciliationRequired: false,
    },
    capitalGains: {
      enabled: initialCategory === "capital_gains" || initialCategory === "trader_investor",
      hasEquityMf: false,
      hasFnoIntraday: initialCategory === "trader_investor",
      hasPropertyAssets: false,
      hasCryptoVda: false,
      shortTermGains: "",
      longTermGains: "",
      brokerName: "",
      totalTransactions: 0,
      source: "USER_DECLARED" as const,
      statementUploaded: false,
    },
    otherSources: {
      enabled: false,
      savingsInterest: "",
      fdInterest: "",
      dividendIncome: "",
      familyPension: "",
      otherIncome: "",
      source: "USER_DECLARED" as const,
    },
  };

  const deductions: ItrStructuredDeductions = {
    sec80c: {
      epf: "",
      ppf: "",
      lic: "",
      elss: "",
      tuitionFees: "",
      housingPrincipal: "",
      other80c: "",
    },
    sec80d: {
      selfSpouseChildren: "",
      parents: "",
      isParentSeniorCitizen: false,
    },
    sec24b: "",
    sec80e: "",
    otherDeductionsList: [],
  };

  const taxesPaid: TaxesPaidDetails = {
    advanceTax: "",
    advanceTaxChallanBsr: "",
    advanceTaxDate: "",
    selfAssessmentTax: "",
  };

  const calculation = calculateItrTax(
    incomeSources,
    deductions,
    taxesPaid,
    "new",
    personalInfo.assessmentYear
  );

  const determinedForm = determineApplicableItrForm(
    incomeSources,
    personalInfo.residentialStatus,
    calculation.grossTotalIncome,
    personalInfo.assessmentYear
  );

  const documents = generateDynamicDocumentChecklist(
    incomeSources,
    priorItrNotice,
    deductions,
    taxesPaid,
    "new",
    personalInfo
  );

  return {
    personalInfo,
    bankDetails,
    bankAccountsList: initialBankAccounts,
    priorItrNotice,
    incomeSources,
    determinedForm,
    regime: "new",
    deductions,
    taxesPaid,
    documents,
    calculation,
    gstReconciliation,
    declarationAccepted: false,
    category: initialCategory,
    accountType: registeredAccountType,
  };
};
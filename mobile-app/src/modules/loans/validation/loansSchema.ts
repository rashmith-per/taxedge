import {
  validatePan,
  validatePhone,
  validateGstin,
} from "../../../shared/validators/indianTaxValidators";
import type {
  LoanDetailsFormData,
  LoanBusinessFormData,
  LoanBankingFormData,
  LoanDocumentItem,
} from "../types/loans.types";

export function validateLoanDetails(
  values: Partial<LoanDetailsFormData>,
  options?: { requireExistingEmi?: boolean; requireIncomeOrTurnover?: boolean }
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!values.loanType || values.loanType.trim() === "") {
    errors.loanType = "Please select a loan type";
  }

  const amountNum = Number(values.requiredAmount);
  if (!values.requiredAmount || isNaN(amountNum) || amountNum <= 0) {
    errors.requiredAmount = "Enter a valid required loan amount (minimum ₹10,000)";
  } else if (amountNum < 10000) {
    errors.requiredAmount = "Minimum loan amount is ₹10,000";
  }

  if (!values.purpose || values.purpose.trim() === "") {
    errors.purpose = "Purpose of loan is required";
  } else if (
    (values.purpose === "Other" || values.purpose === "Others") &&
    (!values.customPurpose || values.customPurpose.trim() === "")
  ) {
    errors.customPurpose = "Please specify your loan purpose";
  }

  const tenureNum = Number(values.preferredTenureMonths);
  if (
    !values.preferredTenureMonths ||
    isNaN(tenureNum) ||
    tenureNum <= 0 ||
    tenureNum > 360
  ) {
    errors.preferredTenureMonths = "Please specify a valid tenure (1 to 360 months)";
  }

  if (!values.employmentType) {
    errors.employmentType = "Please select employment or business type";
  }

  const shouldRequireIncome =
    options?.requireIncomeOrTurnover ??
    (values.loanType !== "Working Capital" && values.loanType !== "Machinery Loan");

  if (shouldRequireIncome) {
    const incomeStr = values.monthlyIncomeOrTurnover?.trim();
    if (!incomeStr) {
      errors.monthlyIncomeOrTurnover = "Enter valid monthly income or annual turnover";
    } else {
      const incomeNum = Number(incomeStr);
      if (!isNaN(incomeNum) && incomeNum <= 0) {
        errors.monthlyIncomeOrTurnover = "Enter valid monthly income or annual turnover";
      }
    }
  }

  if (values.hasExistingLoans && options?.requireExistingEmi !== false) {
    const emiNum = Number(values.existingEmi);
    if (!values.existingEmi || isNaN(emiNum) || emiNum < 0) {
      errors.existingEmi = "Enter current total monthly EMI amount";
    }
  }

  return errors;
}

export function validateLoanBusiness(
  values: Partial<LoanBusinessFormData>
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!values.businessName || values.businessName.trim().length < 2) {
    errors.businessName = "Valid business name is required";
  }

  if (values.gstin && values.gstin.trim() !== "") {
    if (!validateGstin(values.gstin.trim().toUpperCase())) {
      errors.gstin = "Enter a valid 15-character GSTIN";
    }
  }

  if (values.udyamRegistration && values.udyamRegistration.trim() !== "") {
    const udyamRegex = /^UDYAM-[A-Z]{2}-[0-9]{2}-[0-9]{7}$/i;
    if (!udyamRegex.test(values.udyamRegistration.trim())) {
      errors.udyamRegistration = "Format: UDYAM-XX-00-0000000";
    }
  }

  if (
    !values.businessVintageYears ||
    values.businessVintageYears.trim() === ""
  ) {
    errors.businessVintageYears = "Enter business vintage in years";
  }

  const turnoverNum = Number(values.annualTurnover);
  if (
    !values.annualTurnover ||
    isNaN(turnoverNum) ||
    turnoverNum <= 0
  ) {
    errors.annualTurnover = "Enter valid annual turnover amount";
  }

  const profitNum = Number(values.netProfit);
  if (
    values.netProfit === undefined ||
    values.netProfit === "" ||
    isNaN(profitNum)
  ) {
    errors.netProfit = "Enter annual net profit (or 0 if break-even)";
  }

  return errors;
}

export function validateLoanBanking(
  values: Partial<LoanBankingFormData>
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!values.primaryBankName || values.primaryBankName.trim() === "") {
    errors.primaryBankName = "Bank name is required";
  }

  const acc = (values.accountNumber || "").trim();
  if (!acc || !/^\d{9,18}$/.test(acc)) {
    errors.accountNumber = "Enter a valid bank account number (9-18 digits)";
  }

  if (values.confirmAccountNumber !== undefined) {
    if (acc !== (values.confirmAccountNumber || "").trim()) {
      errors.confirmAccountNumber = "Account numbers do not match";
    }
  }

  const ifsc = (values.ifscCode || "").trim().toUpperCase();
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  if (!ifsc || !ifscRegex.test(ifsc)) {
    errors.ifscCode = "Valid 11-character IFSC code is required (e.g. HDFC0001234)";
  }

  if (values.itrFilingStatus === "Filed" && values.itrAckNumber) {
    const ack = values.itrAckNumber.trim();
    if (!/^\d{15}$/.test(ack)) {
      errors.itrAckNumber = "ITR Acknowledgement Number should be 15 digits";
    }
  }

  return errors;
}

export function validateLoanDocuments(
  docs: LoanDocumentItem[]
): { isValid: boolean; missingDocs: string[] } {
  const missing = docs
    .filter((d) => d.required && (!d.fileUri || d.fileUri.trim() === ""))
    .map((d) => d.name);

  return {
    isValid: missing.length === 0,
    missingDocs: missing,
  };
}

export default {
  validateLoanDetails,
  validateLoanBusiness,
  validateLoanBanking,
  validateLoanDocuments,
};

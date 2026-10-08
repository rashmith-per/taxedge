import { apiClient } from "../../../../core/api/apiClient";
import { TdsCustomerIncomeFormData } from "../types/customerIncome.types";
import { parsePositiveNumber } from "../utils/tdsValidation";
import {
  RefundBankAccountDto,
  IncomeTaxInfoDto,
  TdsTaxesPaidDto,
} from "./tdsApiTypes";

// Helper: Extract generated ID from Spring backend string responses like "Saved. ID: TDS-12345"
const extractIdFromResponse = (responseMsg: string): string | null => {
  if (!responseMsg || typeof responseMsg !== "string") return null;
  const match = responseMsg.match(/ID:\s*([A-Za-z0-9_-]+)/i);
  return match ? match[1] : null;
};

export const tdsBankAndIncomeApiService = {
  // ----------------------------------------------------
  // 1. BANK ACCOUNT API
  // ----------------------------------------------------
  saveBankAccount: async (
    bankData: TdsCustomerIncomeFormData["bank"],
    custId: string,
    existingId?: string,
  ): Promise<string> => {
    const payload: RefundBankAccountDto = {
      id: existingId || undefined,
      custId: custId || "CUST-DEFAULT",
      accountHolderName: bankData.accountHolderName || "",
      accountNumber: bankData.accountNumber || "",
      confirmAccountNumber:
        bankData.confirmAccountNumber || bankData.accountNumber || "",
      ifscCode: bankData.ifscCode || "",
      bankName: bankData.bankName || "",
      branchName: bankData.branchName || "",
      accountType: (bankData.accountType?.toUpperCase() === "CURRENT"
        ? "CURRENT"
        : "SAVINGS"),
    };

    const res = await apiClient.post<string>(
      "/itr/refund-bank-account/save",
      payload,
    );
    const extractedId = extractIdFromResponse(res) || existingId || "";
    return extractedId;
  },

  getBankAccount: async (id: string): Promise<RefundBankAccountDto> => {
    return await apiClient.get<RefundBankAccountDto>(
      `/itr/refund-bank-account/${id}`,
    );
  },

  getBankAccountByCustId: async (
    custId: string,
  ): Promise<RefundBankAccountDto | null> => {
    try {
      return await apiClient.get<RefundBankAccountDto>(
        `/itr/refund-bank-account/customer/${custId}`,
      );
    } catch {
      return null;
    }
  },

  // ----------------------------------------------------
  // 2. INCOME & TAX INFO API
  // ----------------------------------------------------
  saveIncomeTaxInfo: async (
    incomeData: TdsCustomerIncomeFormData["income"],
    tdsRefundId: string,
  ): Promise<string> => {
    const payload: IncomeTaxInfoDto = {
      tdsRefundId,
      salaryIncome: parsePositiveNumber(incomeData.salaryIncome),
      otherIncome: parsePositiveNumber(incomeData.otherIncome),
      interestIncome: parsePositiveNumber(incomeData.interestIncome),
      rentalIncome: incomeData.hasRentalIncome
        ? parsePositiveNumber(incomeData.rentalIncome)
        : 0,
      municipalTaxesPaid: incomeData.hasRentalIncome
        ? parsePositiveNumber(incomeData.municipalTaxesPaid)
        : 0,
      shortTermCapitalGains: incomeData.hasCapitalGains
        ? parsePositiveNumber(incomeData.shortTermCapitalGains)
        : 0,
      longTermCapitalGains: incomeData.hasCapitalGains
        ? parsePositiveNumber(incomeData.longTermCapitalGains)
        : 0,
      grossTurnover: incomeData.hasBusinessIncome
        ? parsePositiveNumber(incomeData.grossTurnover)
        : 0,
      netBusinessProfit: incomeData.hasBusinessIncome
        ? parsePositiveNumber(incomeData.netBusinessProfit)
        : 0,
      homeLoanInterestSec24b: incomeData.hasHomeLoan
        ? parsePositiveNumber(incomeData.homeLoanInterestSec24b)
        : 0,
      deductions80C: incomeData.hasDeductions
        ? parsePositiveNumber(incomeData.deductions80C)
        : 0,
      deductions80D: incomeData.hasDeductions
        ? parsePositiveNumber(incomeData.deductions80D)
        : 0,
    };

    return await apiClient.post<string>("/itr/income-tax-info/save", payload);
  },

  getIncomeTaxInfo: async (
    tdsRefundId: string,
  ): Promise<IncomeTaxInfoDto | null> => {
    try {
      return await apiClient.get<IncomeTaxInfoDto>(
        `/itr/income-tax-info/${tdsRefundId}`,
      );
    } catch {
      return null;
    }
  },

  // ----------------------------------------------------
  // 3. TDS & TAXES PAID API
  // ----------------------------------------------------
  saveTdsTaxesPaid: async (
    incomeData: TdsCustomerIncomeFormData["income"],
    custId: string,
    tdsRefundId: string,
  ): Promise<string> => {
    const payload: TdsTaxesPaidDto = {
      custId,
      tdsRefundId,
      totalTdsDeducted: parsePositiveNumber(incomeData.totalTdsDeducted),
      tcsAmount: parsePositiveNumber(incomeData.tcsAmount),
      advanceTax: parsePositiveNumber(incomeData.advanceTaxPaid),
      selfAssessmentTax: parsePositiveNumber(incomeData.selfAssessmentTaxPaid),
    };

    return await apiClient.post<string>("/itr/tds-taxes-paid/save", payload);
  },

  getTdsTaxesPaid: async (
    tdsRefundId: string,
  ): Promise<TdsTaxesPaidDto | null> => {
    try {
      return await apiClient.get<TdsTaxesPaidDto>(
        `/itr/tds-taxes-paid/${tdsRefundId}`,
      );
    } catch {
      return null;
    }
  },
};

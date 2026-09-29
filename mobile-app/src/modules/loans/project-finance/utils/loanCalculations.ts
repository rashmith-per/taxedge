import { RepaymentScheduleRow } from "../types/projectFinance.types";

export const parseNumericValue = (val?: string): number => {
  if (!val) return 0;
  const cleaned = val.replace(/[^0-9.]/g, "");
  return parseFloat(cleaned) || 0;
};

export const formatIndianCurrency = (num: number): string => {
  if (isNaN(num) || num <= 0) return "0";
  return Math.round(num).toLocaleString("en-IN");
};

export const calculateSuggestedLoan = (
  totalCostStr?: string,
  ownContributionStr?: string
): string => {
  const totalCost = parseNumericValue(totalCostStr);
  const ownContribution = parseNumericValue(ownContributionStr);
  if (!totalCost && !ownContribution) return "";
  const suggested = Math.max(0, totalCost - ownContribution);
  return suggested > 0 ? formatIndianCurrency(suggested) : "";
};

export const calculateRepaymentSchedule = (
  loanAmountStr?: string,
  interestRateStr?: string,
  tenureYearsStr?: string
): { schedule: RepaymentScheduleRow[]; calculatedEmi: string } => {
  const p = parseNumericValue(loanAmountStr);
  const annualRate = parseNumericValue(interestRateStr);
  const tenureYears = parseInt((tenureYearsStr || "").replace(/[^0-9]/g, ""), 10);

  if (!p || !annualRate || !tenureYears) {
    return {
      schedule: [],
      calculatedEmi: "",
    };
  }

  const r = annualRate / 100 / 12;
  const n = Math.max(1, tenureYears * 12);

  let monthlyEmi = 0;
  if (r > 0) {
    const factor = Math.pow(1 + r, n);
    monthlyEmi = (p * r * factor) / (factor - 1);
  } else {
    monthlyEmi = p / n;
  }

  let currentBalance = p;
  const rows: RepaymentScheduleRow[] = [];

  for (let year = 1; year <= tenureYears; year++) {
    const openingBalance = currentBalance;
    let yearlyPrincipal = 0;
    let yearlyInterest = 0;

    for (let m = 0; m < 12; m++) {
      if (currentBalance <= 0) break;
      const monthInterest = currentBalance * r;
      let monthPrincipal = monthlyEmi - monthInterest;
      if (monthPrincipal > currentBalance) {
        monthPrincipal = currentBalance;
      }
      yearlyInterest += monthInterest;
      yearlyPrincipal += monthPrincipal;
      currentBalance -= monthPrincipal;
    }

    const totalPayment = yearlyPrincipal + yearlyInterest;
    const closingBalance = Math.max(0, currentBalance);

    rows.push({
      year: `Year ${year}`,
      openingBalance: formatIndianCurrency(openingBalance),
      principal: formatIndianCurrency(yearlyPrincipal),
      interest: formatIndianCurrency(yearlyInterest),
      totalPayment: formatIndianCurrency(totalPayment),
      closingBalance: formatIndianCurrency(closingBalance),
    });
  }

  return {
    schedule: rows,
    calculatedEmi: formatIndianCurrency(monthlyEmi),
  };
};

export const calculateAutoDSCR = (
  operatingCashFlowStr?: string,
  annualDebtServiceStr?: string
): string => {
  const ocf = parseNumericValue(operatingCashFlowStr);
  const ds = parseNumericValue(annualDebtServiceStr);
  if (ocf > 0 && ds > 0) {
    return (ocf / ds).toFixed(2);
  }
  return "";
};

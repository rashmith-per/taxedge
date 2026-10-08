import {
  IncomeSourcesState,
  ItrStructuredDeductions,
  TaxesPaidDetails,
  TaxRegimeType,
  TaxCalculationBreakdown,
} from "../types/itrFiling.types";
import { getTaxRulesForAY, TaxSlab, TaxRuleVersionConfig } from "../../taxRules";

const parseNum = (val?: string | number): number => {
  if (!val) return 0;
  const cleaned = String(val).replace(/,/g, "").trim();
  const num = Number(cleaned);
  return isNaN(num) ? 0 : Math.max(0, num);
};

/**
 * Pure functional slab tax calculator using array reduce.
 * Zero loops.
 */
function computeTaxFromSlabs(taxableIncome: number, slabs: TaxSlab[]): number {
  if (taxableIncome <= 0) return 0;

  return slabs.reduce((accTax, slab) => {
    if (taxableIncome <= slab.min) {
      return accTax;
    }

    const upperLimit = slab.max !== null ? Math.min(taxableIncome, slab.max) : taxableIncome;
    const taxableInThisSlab = Math.max(0, upperLimit - slab.min);
    const taxInThisSlab = taxableInThisSlab * slab.rate;

    return accTax + taxInThisSlab;
  }, 0);
}

type TaxRules = TaxRuleVersionConfig;

/** Income from house property: let-out (NAV less 30% and interest) or self-occupied (capped loss). */
function computeHousePropertyIncome(
  houseProperty: IncomeSourcesState["houseProperty"],
  rules: TaxRules
): number {
  let housePropertyIncome = 0;
  if (houseProperty.enabled) {
    const rent = parseNum(houseProperty.annualRentReceived);
    const taxes = parseNum(houseProperty.municipalTaxesPaid);
    const homeLoan = parseNum(houseProperty.homeLoanInterest);

    if (houseProperty.propertyType === "let_out") {
      const netAnnualValue = Math.max(0, rent - taxes);
      const standard30Percent = netAnnualValue * 0.30;
      housePropertyIncome = netAnnualValue - standard30Percent - homeLoan;
    } else {
      // Self-occupied: loss is limited to section 24b cap
      housePropertyIncome = -Math.min(rules.deductionCaps.sec24bSelfOccupied, homeLoan);
    }
  }
  return housePropertyIncome;
}

/** Business income, using the presumptive minimum for 44AD / 44ADA when no profit is declared. */
function computeBusinessIncome(business: IncomeSourcesState["business"], rules: TaxRules): number {
  let businessIncome = 0;
  if (business.enabled) {
    const declaredProfit = parseNum(business.declaredProfit);
    const turnover = parseNum(business.grossTurnover);

    if (business.businessType === "presumptive_44ad") {
      const minProfit = turnover * rules.presumptiveRates.sec44adDigital;
      businessIncome = declaredProfit > 0 ? declaredProfit : minProfit;
    } else if (business.businessType === "presumptive_44ada") {
      const minProfit = turnover * rules.presumptiveRates.sec44ada;
      businessIncome = declaredProfit > 0 ? declaredProfit : minProfit;
    } else {
      businessIncome = declaredProfit;
    }
  }
  return businessIncome;
}

/** Total eligible Chapter VI-A deductions (80C, 80D, 80E and other listed deductions). */
function computeChapterVIA(deductions: ItrStructuredDeductions, rules: TaxRules): number {
  const raw80c =
    parseNum(deductions.sec80c.epf) +
    parseNum(deductions.sec80c.ppf) +
    parseNum(deductions.sec80c.lic) +
    parseNum(deductions.sec80c.elss) +
    parseNum(deductions.sec80c.tuitionFees) +
    parseNum(deductions.sec80c.housingPrincipal) +
    parseNum(deductions.sec80c.other80c);
  const eligible80c = Math.min(rules.deductionCaps.sec80c, raw80c);

  const raw80dSelf = parseNum(deductions.sec80d.selfSpouseChildren);
  const raw80dParents = parseNum(deductions.sec80d.parents);
  const parentCap = deductions.sec80d.isParentSeniorCitizen
    ? rules.deductionCaps.sec80dSenior
    : rules.deductionCaps.sec80dNormal;
  const eligible80d =
    Math.min(rules.deductionCaps.sec80dNormal, raw80dSelf) +
    Math.min(parentCap, raw80dParents);

  const eligible80e = parseNum(deductions.sec80e);

  const additionalDeductionsTotal = deductions.otherDeductionsList.reduce(
    (sum, item) => sum + parseNum(item.amount),
    0
  );

  return eligible80c + eligible80d + eligible80e + additionalDeductionsTotal;
}

/** Slab tax, Section 87A rebate and 4% cess for one regime. */
function computeRegimeTax(taxableIncome: number, regime: TaxRules["newRegime"]) {
  let grossTax = computeTaxFromSlabs(taxableIncome, regime.slabs);
  let rebate87A = 0;
  if (taxableIncome <= regime.rebate87AThreshold) {
    rebate87A = Math.min(grossTax, regime.rebate87AMax);
  }
  const taxAfterRebate = Math.max(0, grossTax - rebate87A);
  const cess = Math.round(taxAfterRebate * 0.04);
  const totalTax = taxAfterRebate + cess;
  return { grossTax, rebate87A, taxAfterRebate, cess, totalTax };
}

/** One-line comparison shown with the regime recommendation. */
function describeRegimeSavings(
  savingsAmount: number,
  totalTaxNew: number,
  totalTaxOld: number,
  label: string
): string {
  return savingsAmount === 0
    ? `Both tax regimes result in identical tax liability for ${label}.`
    : totalTaxNew < totalTaxOld
    ? `New Tax Regime saves ₹${savingsAmount.toLocaleString("en-IN")} for ${label} due to lower tax slab rates.`
    : `Old Tax Regime saves ₹${savingsAmount.toLocaleString("en-IN")} for ${label} by leveraging your deductions.`;
}

export function calculateItrTax(
  sources: IncomeSourcesState,
  deductions: ItrStructuredDeductions,
  taxesPaid: TaxesPaidDetails,
  chosenRegime: TaxRegimeType,
  assessmentYear: string = "2025-2026"
): TaxCalculationBreakdown {
  const rules = getTaxRulesForAY(assessmentYear);

  // 1. Gross Income components
  const salaryGross = sources.salary.enabled ? parseNum(sources.salary.grossSalary) : 0;
  const allowances = sources.salary.enabled ? parseNum(sources.salary.allowances) : 0;
  const netSalaryBeforeStd = Math.max(0, salaryGross - allowances);

  // House Property
  const housePropertyIncome = computeHousePropertyIncome(sources.houseProperty, rules);

  // Business income
  const businessIncome = computeBusinessIncome(sources.business, rules);

  // Capital Gains
  const capitalGainsIncome = sources.capitalGains.enabled
    ? parseNum(sources.capitalGains.shortTermGains) + parseNum(sources.capitalGains.longTermGains)
    : 0;

  // Other Sources
  const otherIncome = sources.otherSources.enabled
    ? parseNum(sources.otherSources.savingsInterest) +
      parseNum(sources.otherSources.fdInterest) +
      parseNum(sources.otherSources.dividendIncome) +
      parseNum(sources.otherSources.familyPension) +
      parseNum(sources.otherSources.otherIncome)
    : 0;

  const grossTotalIncome = Math.max(
    0,
    netSalaryBeforeStd + housePropertyIncome + businessIncome + capitalGainsIncome + otherIncome
  );

  // 2. Standard Deductions based on AY versioning
  const newRegimeStdDeduction = sources.salary.enabled
    ? Math.min(rules.newRegime.standardDeduction, netSalaryBeforeStd)
    : 0;

  const oldRegimeStdDeduction = sources.salary.enabled
    ? Math.min(rules.oldRegime.standardDeduction, netSalaryBeforeStd)
    : 0;

  // 3. Chapter VI-A Deductions (Old Regime)
  const totalChapterVIA = computeChapterVIA(deductions, rules);

  // 4. Taxable Incomes
  const taxableIncomeNew = Math.max(0, grossTotalIncome - newRegimeStdDeduction);
  const taxableIncomeOld = Math.max(0, grossTotalIncome - oldRegimeStdDeduction - totalChapterVIA);

  // 5. New Regime Tax Computation
  const {
    grossTax: grossTaxNew,
    rebate87A: rebate87ANew,
    taxAfterRebate: taxAfterRebateNew,
    cess: cessNew,
    totalTax: totalTaxNew,
  } = computeRegimeTax(taxableIncomeNew, rules.newRegime);

  // 6. Old Regime Tax Computation
  const {
    grossTax: grossTaxOld,
    rebate87A: rebate87AOld,
    taxAfterRebate: taxAfterRebateOld,
    cess: cessOld,
    totalTax: totalTaxOld,
  } = computeRegimeTax(taxableIncomeOld, rules.oldRegime);

  // 7. Active regime assignments
  const isNew = chosenRegime === "new";
  const standardDeduction = isNew ? newRegimeStdDeduction : oldRegimeStdDeduction;
  const totalDeductions = isNew ? standardDeduction : standardDeduction + totalChapterVIA;
  const taxableIncome = isNew ? taxableIncomeNew : taxableIncomeOld;
  const grossTaxLiability = isNew ? grossTaxNew : grossTaxOld;
  const rebate87A = isNew ? rebate87ANew : rebate87AOld;
  const taxAfterRebate = isNew ? taxAfterRebateNew : taxAfterRebateOld;
  const cess = isNew ? cessNew : cessOld;
  const totalTaxLiability = isNew ? totalTaxNew : totalTaxOld;

  // 8. Taxes Paid & TDS
  const tdsCredits = sources.salary.enabled ? parseNum(sources.salary.tdsDeducted) : 0;
  const advanceTaxPaid = parseNum(taxesPaid.advanceTax);
  const selfAssessmentTaxPaid = parseNum(taxesPaid.selfAssessmentTax);
  const totalTaxesPaid = tdsCredits + advanceTaxPaid + selfAssessmentTaxPaid;

  // 9. Final refund or payable
  const netDifference = totalTaxLiability - totalTaxesPaid;
  const finalAmount = Math.abs(netDifference);
  const finalType = netDifference < 0 ? "REFUND" : netDifference > 0 ? "PAYABLE" : "NIL";

  // 10. Regime Recommendation & Transparent Comparison
  const recommendedRegime: TaxRegimeType = totalTaxNew <= totalTaxOld ? "new" : "old";
  const savingsAmount = Math.abs(totalTaxNew - totalTaxOld);

  const savingsExplanation = describeRegimeSavings(savingsAmount, totalTaxNew, totalTaxOld, rules.label);

  return {
    assessmentYear: rules.assessmentYear,
    financialYear: rules.financialYear,
    grossTotalIncome,
    standardDeduction,
    newRegimeStdDeduction,
    oldRegimeStdDeduction,
    totalChapterVIA: isNew ? 0 : totalChapterVIA,
    totalDeductions,
    taxableIncome,
    taxUnderNewRegime: totalTaxNew,
    taxUnderOldRegime: totalTaxOld,
    grossTaxLiability,
    rebate87A,
    taxAfterRebate,
    cess,
    totalTaxLiability,
    tdsCredits,
    advanceTaxPaid,
    selfAssessmentTaxPaid,
    totalTaxesPaid,
    finalAmount,
    finalType,
    recommendedRegime,
    savingsAmount,
    savingsExplanation,
  };
}

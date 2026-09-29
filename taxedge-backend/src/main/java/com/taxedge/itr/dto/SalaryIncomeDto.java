package com.taxedge.itr.dto;

import com.taxedge.itr.enums.AssetType;
import com.taxedge.itr.enums.PropertyClassification;

import lombok.Data;

@Data
public class SalaryIncomeDto {

	private String incomeSource;

	private String employerLegalName;

	private String grossSalary;

	private String exemptAllowances;

	private String tdsDeductedByEmployer;

	private PropertyClassification propertyClassification;

	private String homeLoanInterestPaid;

	private String annualRentReceived;

	private String municipalTaxesPaid;

	private String howDoYouReportThisBusiness;

	private String grossTurnover;

	private String declaredNetProfit;

	private AssetType assetType;

	private String shortTermGains;

	private String longTermGains;

	private String savingsInterest;

	private String fdTermInterest;

	private String dividendIncome;

	private String otherMiscellaneous;
}
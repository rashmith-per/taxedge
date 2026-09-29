package com.taxedge.itr.entity;

import com.taxedge.itr.enums.AssetType;
import com.taxedge.itr.enums.PropertyClassification;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "salary_income")
@Data
public class SalaryIncome {

	@Id
	@Column(name = "income_id", nullable = false, unique = true)
	private String incomeId;

	@OneToOne
	@JoinColumn(name = "itr_id", nullable = false)
	private ItrFiling itrFiling;

	@Column(name = "income_source", nullable = false)
	private String incomeSource;

	// Salary / Pension

	@Column(name = "employer_legal_name")
	private String employerLegalName;

	@Column(name = "gross_salary")
	private String grossSalary;

	@Column(name = "exempt_allowances")
	private String exemptAllowances;

	@Column(name = "tds_deducted_by_employer")
	private String tdsDeductedByEmployer;

	// House Property

	@Enumerated(EnumType.STRING)
	@Column(name = "property_classification")
	private PropertyClassification propertyClassification;

	@Column(name = "home_loan_interest_paid")
	private String homeLoanInterestPaid;

	@Column(name = "annual_rent_received")
	private String annualRentReceived;

	@Column(name = "municipal_taxes_paid")
	private String municipalTaxesPaid;

	// Business / Profession

	@Column(name = "how_do_you_report_this_business")
	private String howDoYouReportThisBusiness;

	@Column(name = "gross_turnover")
	private String grossTurnover;

	@Column(name = "declared_net_profit")
	private String declaredNetProfit;

	// Capital Gains

	@Enumerated(EnumType.STRING)
	@Column(name = "asset_type")
	private AssetType assetType;

	@Column(name = "short_term_gains")
	private String shortTermGains;

	@Column(name = "long_term_gains")
	private String longTermGains;

	// Other Sources

	@Column(name = "savings_interest")
	private String savingsInterest;

	@Column(name = "fd_term_interest")
	private String fdTermInterest;

	@Column(name = "dividend_income")
	private String dividendIncome;

	@Column(name = "other_miscellaneous")
	private String otherMiscellaneous;
}
package com.taxedge.itr.dto;

import lombok.Data;

@Data
public class RevisedItrDetailsDto {

	private String revisedItrId;

	private String salaryBusinessIncome;

	private String otherIncome;

	private String deduction80C;

	private String deduction80D;

	private String homeLoanInterest;

	private String taxableIncome;

	private String bankAccountForRefund;

	private String ifscCode;
}
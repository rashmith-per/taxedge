package com.taxedge.itr.dto;

import lombok.Data;

@Data
public class ItrFilingPostDto {

	private String customerId;

	private String assessmentYear;

	private String residentialStatus;

	private String filingType;

	private String bankName;

	private String accountNumber;

	private String ifscCode;
}
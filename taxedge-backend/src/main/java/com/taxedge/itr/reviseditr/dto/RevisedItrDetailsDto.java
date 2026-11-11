package com.taxedge.itr.reviseditr.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevisedItrDetailsDto {

	@NotBlank(message = "Revised ITR ID is required")
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

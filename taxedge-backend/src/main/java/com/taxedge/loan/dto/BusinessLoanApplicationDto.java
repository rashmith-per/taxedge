package com.taxedge.loan.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.taxedge.loan.enums.EmploymentProfile;
import com.taxedge.loan.enums.ExistingLoanStatus;
import com.taxedge.loan.enums.LoanApplicationStatus;
import com.taxedge.loan.enums.LoanPurpose;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusinessLoanApplicationDto {

    private String id;

    private String custId;

    private EmploymentProfile employmentProfile;

    private BigDecimal loanAmount;

    private LoanPurpose loanPurpose;

    private Integer tenureMonths;

    private BigDecimal annualTurnover;

    private ExistingLoanStatus existingLoanStatus;

    private LoanApplicationStatus status;

    private LocalDateTime createdAt;
}
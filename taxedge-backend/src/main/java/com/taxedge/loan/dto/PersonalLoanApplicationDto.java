package com.taxedge.loan.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.taxedge.loan.enums.ExistingLoanStatus;
import com.taxedge.loan.enums.LoanApplicationStatus;
import com.taxedge.loan.enums.PersonalLoanPurpose;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PersonalLoanApplicationDto {

    private String id;

    private String custId;

    private BigDecimal loanAmount;

    private PersonalLoanPurpose loanPurpose;

    private Integer tenureMonths;

    private BigDecimal monthlyNetSalary;

    private ExistingLoanStatus existingLoanStatus;

    private String primaryBankName;

    private String accountNumber;

    private String ifscCode;

    private LoanApplicationStatus status;

    private LocalDateTime createdAt;
}

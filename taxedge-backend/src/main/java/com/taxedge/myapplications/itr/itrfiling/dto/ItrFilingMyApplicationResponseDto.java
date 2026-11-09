package com.taxedge.myapplications.itr.itrfiling.dto;

import java.time.LocalDateTime;

import com.taxedge.gst.registration.enums.RegisterationStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItrFilingMyApplicationResponseDto {
    private String itrId;
    private String applicationType;
    private RegisterationStatus status;
    private Long assignedAgentId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime submittedAt;

    // Step 1: Personal / Return Info
    private String assessmentYear;
    private String residentialStatus;
    private String filingType;
    private String bankName;
    private String accountNumber;
    private String ifscCode;

    // Step 2: Salary Income Info
    private String incomeSource;
    private String employerLegalName;
    private String grossSalary;
    private String exemptAllowances;
    private String tdsDeductedByEmployer;

    // Step 3: Documents flags
    private boolean form16Uploaded;
    private boolean form26asUploaded;
    private boolean aisTisUploaded;
    private boolean bankAccountStatementUploaded;
    private boolean salaryPayslipsUploaded;
}

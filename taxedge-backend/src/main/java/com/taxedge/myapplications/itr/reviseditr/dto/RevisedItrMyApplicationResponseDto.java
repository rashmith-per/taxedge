package com.taxedge.myapplications.itr.reviseditr.dto;

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
public class RevisedItrMyApplicationResponseDto {
    private String revisedItrId;
    private String applicationType;
    private RegisterationStatus status;
    private Long assignedAgentId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime submittedAt;

    // Step 1: Base & Assessment info
    private String assessmentYear;
    private String itrAcknowledgementNumber;

    // Step 2: Revised Details
    private String salaryBusinessIncome;
    private String otherIncome;
    private String deduction80C;
    private String deduction80D;
    private String homeLoanInterest;
    private String taxableIncome;
    private String bankAccountForRefund;

    // Step 3: Revision Reason
    private String reason;
    private String otherReason;

    // Step 4: Documents flags
    private boolean panCardUploaded;
    private boolean aadhaarCardUploaded;
    private boolean form16Uploaded;
    private boolean aisTisStatementUploaded;
    private boolean bankStatementsUploaded;
}

package com.taxedge.myapplications.itr.tdsrefund.dto;

import java.time.LocalDateTime;

import com.taxedge.gst.registration.enums.RegisterationStatus;
import com.taxedge.itr.tdsrefund.enums.AccountType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TdsRefundMyApplicationResponseDto {
    private String tdsRefundId;
    private String applicationType;
    private RegisterationStatus status;
    private Long assignedAgentId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime submittedAt;

    // Banking & Personal Details
    private String accountHolderName;
    private String accountNumber;
    private String ifscCode;
    private String bankName;
    private String branchName;
    private AccountType accountType;
    private String legalBusinessName;
    private String businessPan;
    private String aadhaarNumber;
    private String mobileNumber;

    // Documents flags
    private boolean businessPanDocumentUploaded;
    private boolean aadhaarDocumentUploaded;
}

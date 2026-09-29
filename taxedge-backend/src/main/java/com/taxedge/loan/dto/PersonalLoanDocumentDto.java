package com.taxedge.loan.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PersonalLoanDocumentDto {

    private Long id;

    private String loanApplicationId;

    private byte[] panCardFile;

    private byte[] aadhaarCardFile;

    private byte[] addressProofFile;

    private byte[] photographFile;

    private byte[] bankStatementsFile;

    private byte[] salarySlipsFile;

    private LocalDateTime createdAt;
}

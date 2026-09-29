package com.taxedge.loan.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.taxedge.loan.enums.BusinessConstitution;
import com.taxedge.loan.enums.BusinessVintage;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusinessLoanProfileDto {

    private Long id;

    private String loanApplicationId;

    private String firmName;
    private BusinessConstitution businessConstitution;
    private String gstin;
    private Boolean hasUdyamRegistration;
    private String udyamRegistrationNumber;
    private BusinessVintage businessVintage;
    private BigDecimal annualTurnover;
    private BigDecimal annualNetProfit;

    private String signatoryName;
    private String signatoryDesignation;
    private String signatoryEmail;

    private LocalDateTime createdAt;
}
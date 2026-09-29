package com.taxedge.loan.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.taxedge.loan.enums.BusinessConstitution;
import com.taxedge.loan.enums.BusinessVintage;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "business_loan_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusinessLoanProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "loan_application_id", unique = true,
                foreignKey = @ForeignKey(name = "fk_loan_profile_application"))
    private BusinessLoanApplication loanApplication;

    @Column(name = "firm_name", length = 200)
    private String firmName;

    @Enumerated(EnumType.STRING)
    @Column(name = "business_constitution", length = 30)
    private BusinessConstitution businessConstitution;

    @Column(name = "gstin", length = 15)
    private String gstin;

    @Column(name = "has_udyam_registration")
    private Boolean hasUdyamRegistration;

    @Column(name = "udyam_registration_number", length = 30)
    private String udyamRegistrationNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "business_vintage", length = 30)
    private BusinessVintage businessVintage;

    @Column(name = "annual_turnover", precision = 15, scale = 2)
    private BigDecimal annualTurnover;

    @Column(name = "annual_net_profit", precision = 15, scale = 2)
    private BigDecimal annualNetProfit;

    @Column(name = "signatory_name", length = 150)
    private String signatoryName;

    @Column(name = "signatory_designation", length = 100)
    private String signatoryDesignation;

    @Column(name = "signatory_email", length = 150)
    private String signatoryEmail;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
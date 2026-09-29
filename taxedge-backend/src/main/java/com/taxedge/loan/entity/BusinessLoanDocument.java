package com.taxedge.loan.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "business_loan_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusinessLoanDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "loan_application_id", unique = true,
                foreignKey = @ForeignKey(name = "fk_loan_document_application"))
    private BusinessLoanApplication loanApplication;

    @Column(name = "pan_card_file")
    private byte[] panCardFile;

    @Column(name = "aadhaar_card_file")
    private byte[] aadhaarCardFile;

    @Column(name = "kyc_directors_file")
    private byte[] kycDirectorsFile;

    @Column(name = "business_address_proof_file")
    private byte[] businessAddressProofFile;

    @Column(name = "bank_statements_file")
    private byte[] bankStatementsFile;

    @Column(name = "gst_certificate_file")
    private byte[] gstCertificateFile;

    @Column(name = "gst_returns_file")
    private byte[] gstReturnsFile;

    @Column(name = "business_itr_file")
    private byte[] businessItrFile;

    @Column(name = "audited_balance_sheet_file")
    private byte[] auditedBalanceSheetFile;

    @Column(name = "profit_loss_statement_file")
    private byte[] profitLossStatementFile;

    @Column(name = "cash_flow_statement_file")
    private byte[] cashFlowStatementFile;

    @Column(name = "udyam_certificate_file")
    private byte[] udyamCertificateFile;

    @Column(name = "business_registration_proof_file")
    private byte[] businessRegistrationProofFile;

    @Column(name = "business_expansion_document_file")
    private byte[] businessExpansionDocumentFile;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
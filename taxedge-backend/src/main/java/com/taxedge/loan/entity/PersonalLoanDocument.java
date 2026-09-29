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
@Table(name = "personal_loan_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonalLoanDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "loan_application_id", unique = true,
                foreignKey = @ForeignKey(name = "fk_personal_loan_document_application"))
    private PersonalLoanApplication loanApplication;

   
    @Column(name = "pan_card_file")
    private byte[] panCardFile;

    @Column(name = "aadhaar_card_file")
    private byte[] aadhaarCardFile;

    @Column(name = "address_proof_file")
    private byte[] addressProofFile;

    @Column(name = "photograph_file")
    private byte[] photographFile;


    @Column(name = "bank_statements_file")
    private byte[] bankStatementsFile;

    @Column(name = "salary_slips_file")
    private byte[] salarySlipsFile;

 

 

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}

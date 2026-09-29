package com.taxedge.loan.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.taxedge.customer.entity.Customer;
import com.taxedge.loan.enums.EmploymentProfile;
import com.taxedge.loan.enums.ExistingLoanStatus;
import com.taxedge.loan.enums.LoanApplicationStatus;
import com.taxedge.loan.enums.LoanPurpose;
import com.taxedge.loan.helper.BusinessLoanHelper;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "business_loan_applications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusinessLoanApplication {

    @Id
    @Column(name = "loan_application_id", nullable = false, updatable = false, length = 20)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cust_id",
                foreignKey = @ForeignKey(name = "fk_loan_application_customer"))
    private Customer customer;

    @Enumerated(EnumType.STRING)
    @Column(name = "employment_profile", length = 30)
    private EmploymentProfile employmentProfile;

    @Column(name = "loan_amount", precision = 15, scale = 2)
    private BigDecimal loanAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "loan_purpose", length = 40)
    private LoanPurpose loanPurpose;

    @Column(name = "tenure_months")
    private Integer tenureMonths;

    @Column(name = "annual_turnover")
    private BigDecimal annualTurnover;

    @Enumerated(EnumType.STRING)
    @Column(name = "existing_loan_status", length = 20)
    private ExistingLoanStatus existingLoanStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private LoanApplicationStatus status;

   

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (this.id == null) {
            this.id = BusinessLoanHelper.generateLoanApplicationId();
        }
        this.createdAt = LocalDateTime.now();
        this.status = LoanApplicationStatus.DRAFT;
        
    }
}
package com.taxedge.loan.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.taxedge.customer.entity.Customer;
import com.taxedge.loan.enums.ExistingLoanStatus;
import com.taxedge.loan.enums.LoanApplicationStatus;
import com.taxedge.loan.enums.PersonalLoanPurpose;
import com.taxedge.loan.helper.PersonalLoanHelper;

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
@Table(name = "personal_loan_applications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonalLoanApplication {

    @Id
    @Column(name = "loan_application_id", nullable = false, updatable = false, length = 20)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cust_id",
                foreignKey = @ForeignKey(name = "fk_personal_loan_application_customer"))
    private Customer customer;

    @Column(name = "loan_amount", precision = 15, scale = 2, nullable = false)
    private BigDecimal loanAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "loan_purpose", length = 40)
    private PersonalLoanPurpose loanPurpose;

    @Column(name = "tenure_months")
    private Integer tenureMonths;

    @Column(name = "monthly_net_salary", precision = 15, scale = 2)
    private BigDecimal monthlyNetSalary;

    @Enumerated(EnumType.STRING)
    @Column(name = "existing_loan_status", length = 20)
    private ExistingLoanStatus existingLoanStatus;

    @Column(name = "primary_bank_name", length = 100)
    private String primaryBankName;

    @Column(name = "account_number", length = 35)
    private String accountNumber;

    @Column(name = "ifsc_code", length = 15)
    private String ifscCode;

   

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private LoanApplicationStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (this.id == null) {
            this.id = PersonalLoanHelper.generateLoanApplicationId();
        }
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = LoanApplicationStatus.DRAFT;
        }
    }
}

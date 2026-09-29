package com.taxedge.companyregistration.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "company_registration_payments", indexes = @Index(name = "idx_company_payment_registration", columnList = "company_registration_id"))
@Getter @Setter @NoArgsConstructor
public class CompanyRegistrationPayment extends AuditedEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "company_registration_id", nullable = false) private CompanyRegistration registration;
    @Column(nullable = false, precision = 19, scale = 2) private BigDecimal amount;
    @Column(name = "government_fee", precision = 19, scale = 2) private BigDecimal governmentFee;
    @Column(name = "professional_fee", precision = 19, scale = 2) private BigDecimal professionalFee;
    @Column(name = "total_amount", precision = 19, scale = 2) private BigDecimal totalAmount;
    @Column(name = "payment_status", nullable = false) private String paymentStatus;
    private String transactionId;
    private String paymentGateway;
    private String paymentMethod;
    private LocalDateTime paidAt;
}

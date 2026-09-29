package com.taxedge.companyregistration.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "company_registrations", indexes = {
    @Index(name = "idx_company_registration_user", columnList = "user_id"),
    @Index(name = "idx_company_registration_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
public class CompanyRegistration extends AuditedEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, length = 50)
    private String userId;

    @Column(name = "application_number", nullable = false, unique = true, length = 40)
    private String applicationNumber;

    @Column(name = "company_type", nullable = false, length = 100)
    private String companyType;

    @Column(nullable = false, length = 40)
    private String status;

    @Column(name = "current_step", nullable = false)
    private Integer currentStep = 0;

    @Column(name = "submitted_at")
    private java.time.LocalDateTime submittedAt;
}

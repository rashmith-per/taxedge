package com.taxedge.companyregistration.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "company_registration_tracking", indexes = @Index(name = "idx_company_tracking_registration", columnList = "company_registration_id"))
@Getter @Setter @NoArgsConstructor
public class CompanyRegistrationTracking extends AuditedEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "company_registration_id", nullable = false) private CompanyRegistration registration;
    @Column(nullable = false) private String stage;
    @Column(nullable = false) private String status;
    @Column(length = 1000) private String description;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private String remarks;
}

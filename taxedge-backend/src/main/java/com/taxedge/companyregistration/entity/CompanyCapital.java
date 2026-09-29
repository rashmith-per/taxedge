package com.taxedge.companyregistration.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "company_capital")
@Getter @Setter @NoArgsConstructor
public class CompanyCapital extends AuditedEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @OneToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "company_registration_id", nullable = false, unique = true) private CompanyRegistration registration;
    @Column(name = "authorized_capital", nullable = false, precision = 19, scale = 2) private BigDecimal authorizedCapital;
    @Column(name = "paid_up_capital", nullable = false, precision = 19, scale = 2) private BigDecimal paidUpCapital;
    @Column(name = "number_of_shares") private Long numberOfShares;
    @Column(name = "face_value_per_share", precision = 19, scale = 2) private BigDecimal faceValuePerShare;
}

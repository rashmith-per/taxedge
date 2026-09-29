package com.taxedge.companyregistration.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "company_shareholdings", indexes = @Index(name = "idx_company_shareholding_registration", columnList = "company_registration_id"))
@Getter @Setter @NoArgsConstructor
public class CompanyShareholding extends AuditedEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "company_registration_id", nullable = false) private CompanyRegistration registration;
    private String person;
    @Column(name = "number_of_shares") private Long numberOfShares;
    @Column(name = "share_value", precision = 19, scale = 2) private BigDecimal shareValue;
    @Column(precision = 7, scale = 3) private BigDecimal percentage;
}

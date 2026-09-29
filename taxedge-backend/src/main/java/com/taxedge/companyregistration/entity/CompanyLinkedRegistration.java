package com.taxedge.companyregistration.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "company_linked_registrations")
@Getter @Setter @NoArgsConstructor
public class CompanyLinkedRegistration extends AuditedEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @OneToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "company_registration_id", nullable = false, unique = true) private CompanyRegistration registration;
    private boolean pan;
    private boolean tan;
    private boolean gst;
    private boolean esic;
    private boolean epfo;
    private boolean professionalTax;
    private boolean bankAccount;
}

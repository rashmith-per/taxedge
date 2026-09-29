package com.taxedge.companyregistration.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "company_registered_offices")
@Getter @Setter @NoArgsConstructor
public class CompanyRegisteredOffice extends AuditedEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "company_registration_id", nullable = false, unique = true)
    private CompanyRegistration registration;
    @Column(name = "address_line", nullable = false) private String addressLine;
    @Column(nullable = false) private String city;
    private String district;
    @Column(nullable = false) private String state;
    @Column(nullable = false) private String pincode;
    @Column(name = "premises_ownership") private String premisesOwnership;
        private String officeAddressProofName;
        private String officeAddressProofUri;
        private String ownershipDocName;
        private String ownershipDocUri;
        private String ownerNocName;
        private String ownerNocUri;
}

package com.taxedge.companyregistration.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "company_persons", indexes = @Index(name = "idx_company_person_registration", columnList = "company_registration_id"))
@Getter @Setter @NoArgsConstructor
public class CompanyPerson extends AuditedEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "company_registration_id", nullable = false) private CompanyRegistration registration;
    @Column(name = "person_type", nullable = false) private String personType;
    @Column(nullable = false) private String name;
    @Column(nullable = false) private String pan;
    private String aadhaar;
    private LocalDate dob;
    private String fatherName;
    private String gender;
    private String nationality;
    private String placeOfBirth;
    private String occupation;
    private String educationalQualification;
    private String designation;
    private String category;
    @Column(nullable = false) private String email;
    private String phone;
    private Boolean hasDin;
    private String din;
    private Boolean hasDsc;
    private BigDecimal sharesPercentage;
    private String residentialAddress;
    private Boolean isResidentInIndia;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String district;
    private String state;
    private String pinCode;
    private Boolean sameAsPermanentAddress;
    private String presentAddressLine1;
    private String presentAddressLine2;
    private String presentCity;
    private String presentDistrict;
    private String presentState;
    private String presentPincode;
    private Long numberOfShares;
    private BigDecimal amountSubscribed;
    private BigDecimal contributionAmount;
    private BigDecimal profitSharePercentage;
    private BigDecimal capitalContribution;
    private BigDecimal profitSharingRatio;
    private String relationship;
    private String identityProofDocName;
    private String residentialAddressProofDocName;
}

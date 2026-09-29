package com.taxedge.companyregistration.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "company_details")
@Getter
@Setter
@NoArgsConstructor
public class CompanyDetails extends AuditedEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "company_registration_id", nullable = false, unique = true)
    private CompanyRegistration registration;
    @Column(name = "industry_category") private String industryCategory;
    @Column(name = "business_activity_description", length = 1000) private String businessActivityDescription;
    @Column(name = "company_class") private String companyClass;
    @Column(name = "company_category") private String companyCategory;
    @Column(name = "company_sub_category") private String companySubCategory;
    @Column(name = "primary_activity", nullable = false) private String primaryActivity;
    @Column(name = "nic_code", nullable = false) private String nicCode;
    @Column(name = "secondary_activity") private String secondaryActivity;
    @Column(name = "proposed_name1", nullable = false) private String proposedName1;
    @Column(name = "proposed_name2", nullable = false) private String proposedName2;
    @Column(name = "proposed_name3") private String proposedName3;
    @Column(name = "name_suffix") private String nameSuffix;
    @Column(name = "name_availability_status") private String nameAvailabilityStatus;
    @Column(name = "company_email") private String companyEmail;
    @Column(name = "company_mobile") private String companyMobile;
    @Column(name = "authorized_capital", precision = 19, scale = 2) private BigDecimal authorizedCapital;
    @Column(name = "paid_up_capital", precision = 19, scale = 2) private BigDecimal paidUpCapital;
    @Column(name = "number_of_shares") private Long numberOfShares;
    @Column(name = "face_value_per_share", precision = 19, scale = 2) private BigDecimal faceValuePerShare;
}

package com.taxedge.companyregistration.entity;

import com.taxedge.customer.entity.Customer;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "company_registration_documents", indexes = {
    @Index(name = "idx_company_document_registration", columnList = "company_registration_id"),
    @Index(name = "idx_company_document_cust", columnList = "cust_id")
})
@Getter @Setter @NoArgsConstructor
public class CompanyRegistrationDocument extends AuditedEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "company_registration_id", nullable = false) private CompanyRegistration registration;
    @Column(name = "cust_id", nullable = false, length = 50) private String custId;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cust_id", referencedColumnName = "cust_id", insertable = false, updatable = false)
    private Customer customer;
    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false, length = 40)
    private CompanyRegistrationDocumentType documentType;
    private String name;
    private String category;
    @Column(nullable = false) private boolean required;
    @Column(name = "file_name", nullable = false) private String fileName;
        @Column(name = "file_uri", length = 2000) private String fileUri;
    @Lob @Column(name = "file_data", columnDefinition = "LONGTEXT") private String fileData;
    @Column(name = "file_size") private Long fileSize;
    @Column(name = "mime_type") private String mimeType;
    @Column(nullable = false) private String status;
    @Column(name = "uploaded_at", nullable = false) private LocalDateTime uploadedAt;
    @Column(name = "verified_at") private LocalDateTime verifiedAt;
    private String remarks;
}

package com.taxedge.gst.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "signatory_amendments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SignatoryAmendmentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gst_id", referencedColumnName = "gst_id", nullable = false)
    private Business business;

    @Column(name = "new_signatory_name", nullable = false)
    private String newSignatoryName;

    @Column(name = "new_signatory_pan", nullable = false)
    private String newSignatoryPan;

    @Column(name = "new_signatory_dob")
    private LocalDate newSignatoryDob;

    @Column(name = "new_designation")
    private String newDesignation;

    @Column(name = "new_signatory_mobile")
    private String newSignatoryMobile;

    @Column(name = "new_signatory_email")
    private String newSignatoryEmail;

    @Column(name = "image_data", columnDefinition = "LONGTEXT")
    private String imageData;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
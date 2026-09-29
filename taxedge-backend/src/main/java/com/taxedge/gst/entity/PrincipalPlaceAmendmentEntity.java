package com.taxedge.gst.entity;

import jakarta.persistence.*;
import com.taxedge.gst.enums.NatureOfPremises;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "principal_place_amendments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrincipalPlaceAmendmentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gst_id", referencedColumnName = "gst_id", nullable = false)
    private Business business;

    @Column(name = "new_business_address", nullable = false)
    private String newBusinessAddress;

    @Column(name = "new_city", nullable = false)
    private String newCity;

    @Column(name = "new_district", nullable = false)
    private String newDistrict;

    @Column(name = "new_state", nullable = false)
    private String newState;

    @Column(name = "new_pin_code", nullable = false)
    private String newPinCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "nature_of_premises", nullable = false)
    private NatureOfPremises natureOfPremises;

    @Column(name = "image_data", columnDefinition = "LONGTEXT")
    private String imageData;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
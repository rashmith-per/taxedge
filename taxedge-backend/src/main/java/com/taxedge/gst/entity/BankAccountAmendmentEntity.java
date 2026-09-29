package com.taxedge.gst.entity;

import jakarta.persistence.*;
import com.taxedge.gst.enums.AccountType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "bank_account_amendments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BankAccountAmendmentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gst_id", referencedColumnName = "gst_id", nullable = false)
    private Business business;

    @Column(name = "new_bank_name", nullable = false)
    private String newBankName;

    @Column(name = "new_bank_account_number", nullable = false)
    private String newBankAccountNumber;

    @Column(name = "new_ifsc_code", nullable = false)
    private String newIfscCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_account_type", nullable = false)
    private AccountType newAccountType;

    @Column(name = "image_data", columnDefinition = "LONGTEXT")
    private String imageData;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}

package com.taxedge.itr.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "tds_taxes_paid")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TdsTaxesPaid {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;                                  


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tds_refund_id",
                foreignKey = @ForeignKey(name = "fk_tds_taxes_refund"))
    private RefundBankAccount refundBankAccount;

    @Column(name = "total_tds_deducted", nullable = false)
    private BigDecimal totalTdsDeducted;

    @Column(name = "tcs_amount")
    private BigDecimal tcsAmount;

    @Column(name = "advance_tax")
    private BigDecimal advanceTax;

    @Column(name = "self_assessment_tax")
    private BigDecimal selfAssessmentTax;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
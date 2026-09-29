package com.taxedge.messaging.entity;

import java.time.LocalDateTime;

import com.taxedge.messaging.enums.CaAvailabilityStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Tracks the real-time availability and workload of each CA accountant.
 * One record per CA — created when CA registers, updated as they go online/offline.
 *
 * DB table: ca_availability
 */
@Entity
@Table(name = "ca_availability")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CaAvailability {

    /**
     * Matches the caId from the Employee/Admin entity.
     * One-to-one with CA employee record.
     */
    @Id
    @Column(name = "ca_id", length = 50, nullable = false, updatable = false)
    private String caId;

    /**
     * Display name of the CA (denormalized for quick queries).
     */
    @Column(name = "ca_name", length = 100, nullable = false)
    private String caName;

    /**
     * Current availability state of the CA.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private CaAvailabilityStatus status = CaAvailabilityStatus.OFFLINE;

    /**
     * How many chat rooms are currently OPEN for this CA.
     * Incremented on room creation, decremented on room close/transfer.
     */
    @Column(name = "active_chats", nullable = false)
    @Builder.Default
    private int activeChats = 0;

    /**
     * Maximum number of simultaneous open chats allowed for this CA.
     * When activeChats >= maxChats, status is automatically set to BUSY.
     */
    @Column(name = "max_chats", nullable = false)
    @Builder.Default
    private int maxChats = 5;

    @Column(name = "push_token", length = 500)
    private String pushToken;
  
    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.lastUpdated = LocalDateTime.now();
    }

    @PreUpdate
    void onUpdate() {
        this.lastUpdated = LocalDateTime.now();
        // Auto-manage BUSY status based on load
        if (this.activeChats >= this.maxChats) {
            this.status = CaAvailabilityStatus.BUSY;
        } else if (this.status == CaAvailabilityStatus.BUSY && this.activeChats < this.maxChats) {
            this.status = CaAvailabilityStatus.AVAILABLE;
        }
    }
}

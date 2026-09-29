package com.taxedge.messaging.dto;

import com.taxedge.messaging.enums.CaAvailabilityStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * CaAvailabilityDto has two uses:
 *
 * REQUEST (PUT /chat/ca/{caId}/status):
 *   CA sends → { status: "AVAILABLE" } or { status: "BUSY" }
 *   Also used when CA registers their push token.
 *
 * RESPONSE (GET /chat/ca/available or admin dashboards):
 *   Returns full availability picture of one or all CAs.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CaAvailabilityDto {

    /** CA's unique ID — matches employee/admin record */
    private String caId;

    /** CA display name */
    private String caName;

    /** AVAILABLE | BUSY | OFFLINE */
    private CaAvailabilityStatus status;

    /**
     * Current number of open chat rooms.
     * Read-only — managed by server, client never sends this.
     */
    private int activeChats;

    /**
     * Maximum chats this CA can handle simultaneously.
     * Admin can change this. Default is 5.
     */
    private int maxChats;

    /**
     * Firebase device push token.
     * CA app sends this on login so server can push
     * notifications when CA is offline.
     */
    private String pushToken;
}

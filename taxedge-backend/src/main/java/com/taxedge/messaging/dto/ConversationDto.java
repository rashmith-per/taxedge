package com.taxedge.messaging.dto;

import java.time.LocalDateTime;

import com.taxedge.messaging.enums.RoomStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ConversationDto has two uses:
 *
 * REQUEST (POST /chat/room/create):
 *   Client sends only → customerId
 *   CA assignment is done automatically by server
 *
 * RESPONSE (GET /chat/rooms/...):
 *   Server returns full room details including caId, caName, status, timestamps
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationDto {

    /** Room ID — null on request, set by server on response */
    private String roomId;

    /** Customer who owns this room — set by server from JWT on create */
    private String customerId;

    /** Customer's display name — set by server on response */
    private String customerName;

    /**
     * CA assigned to this room.
     * On REQUEST: leave null — server auto-assigns using least-load strategy.
     * On RESPONSE: contains the assigned CA's ID.
     */
    private String caId;

    /** CA display name — set by server on response */
    private String caName;

    /** OPEN | CLOSED | TRANSFERRED */
    private RoomStatus status;

    /** When room was created — set by server */
    private LocalDateTime createdAt;

    /** When room was closed — null if still open */
    private LocalDateTime closedAt;

    /**
     * On TRANSFER request: set this to the target CA's ID.
     * On RESPONSE: shows which CA it was transferred to (if applicable).
     */
    private String transferredToCaId;

    /**
     * Last message preview — useful for CA dashboard room list.
     * Example: "Hello, I need help with my ITR"
     * Populated by server on GET /chat/rooms — not stored in DB.
     */
    private String lastMessage;

    /**
     * Count of unread messages in this room — for badge display.
     * Populated by server on GET /chat/rooms — not stored in DB.
     */
    private int unreadCount;
}

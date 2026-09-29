package com.taxedge.messaging.dto;

import java.time.LocalDateTime;

import com.taxedge.messaging.enums.MessageType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Used in two directions:
 *  - INBOUND : client sends this over WebSocket STOMP to /app/chat.send
 *  - OUTBOUND: server broadcasts this to /topic/{roomId} after saving to DB
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageDto {

    /** Set by server after saving — null when sent from client */
    private Long id;

    /** Which room this message belongs to — REQUIRED from client */
    private String roomId;

    /** Set by server from JWT — client should NOT send this */
    private String senderId;

    /** Set by server from DB — client should NOT send this */
    private String senderName;

    /**
     * Set by server: "CUSTOMER" or "CA_ACCOUNTANT"
     * Mobile app uses this to decide left/right bubble
     */
    private String senderType;

    /** The actual text — null for JOIN / LEAVE / TYPING */
    private String content;

    /** CHAT | JOIN | LEAVE | TYPING — client must send this */
    private MessageType messageType;

    /** Set by server after DB save */
    private boolean read;

    /** Set by server — timestamp of when message was persisted */
    private LocalDateTime sentAt;
}

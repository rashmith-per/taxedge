package com.taxedge.messaging.entity;

import java.time.LocalDateTime;

import com.taxedge.messaging.enums.MessageType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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

/**
 * A single chat message sent inside a Conversation room.
 * Both Customer and CA messages are stored in this same table,
 * distinguished by senderType.
 *
 * DB table: chat_messages
 */
@Entity
@Table(name = "chat_messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    /**
     * The room this message belongs to.
     * Many messages → one conversation room.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "room_id",
        referencedColumnName = "room_id",
        nullable = false,
        updatable = false,
        foreignKey = @ForeignKey(name = "fk_message_room")
    )
    private Conversation conversation;

    /**
     * ID of the sender — either custId or caId.
     * Determined at runtime from JWT principal.
     */
    @Column(name = "sender_id", length = 50, nullable = false, updatable = false)
    private String senderId;

    /**
     * Name of the sender for display in UI (denormalized).
     */
    @Column(name = "sender_name", length = 100)
    private String senderName;

    /**
     * CUSTOMER or CA_ACCOUNTANT — determines which side of the chat bubble.
     */
    @Column(name = "sender_type", length = 20, nullable = false, updatable = false)
    private String senderType;

    /**
     * The actual text content of the message.
     * Null for TYPING / JOIN / LEAVE events.
     */
    @Column(name = "content", columnDefinition = "LONGTEXT")
    private String content;

    /**
     * CHAT | JOIN | LEAVE | TYPING
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "message_type", length = 20, nullable = false, updatable = false)
    private MessageType messageType;

    /**
     * Whether the other party has read this message.
     */
    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private boolean read = false;

    /**
     * When the message was sent. Set automatically on persist.
     */
    @Column(name = "sent_at", nullable = false, updatable = false)
    private LocalDateTime sentAt;

    @PrePersist
    void onCreate() {
        this.sentAt = LocalDateTime.now();
    }
}

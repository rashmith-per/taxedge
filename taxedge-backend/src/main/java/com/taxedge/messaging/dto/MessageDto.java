package com.taxedge.messaging.dto;

import java.time.LocalDateTime;

import com.taxedge.messaging.enums.MessageType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageDto {

    private Long id;

    private String managerId;
    private String agentId;
    private String recipientId;
    private String clientMessageId;
    private String senderId;
    private String senderName;
    private MessageType messageType;
    private String content;
    private String attachmentKey;
    private String attachmentName;
    private String attachmentMime;

    private LocalDateTime sentAt;
    private LocalDateTime deliveredAt;
    private LocalDateTime readAt;
}

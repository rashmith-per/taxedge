package com.taxedge.messaging.service;

import java.security.Principal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.taxedge.messaging.dto.MessageDto;
import com.taxedge.messaging.entity.Message;
import com.taxedge.messaging.enums.MessageType;
import com.taxedge.messaging.mapper.MessageMapper;
import com.taxedge.messaging.repository.MessageRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private static final String USER_QUEUE = "/queue/messages";
    private static final int MAX_PAGE_SIZE = 100;
    private static final int DEFAULT_PAGE_SIZE = 50;

    private final MessageRepository messageRepository;
    private final MessageMapper messageMapper;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public MessageDto saveMessage(MessageDto dto, Principal sender) {

        String senderId = sender.getName();
        String recipientId = dto.getRecipientId();

        String managerId = dto.getManagerId();
        String agentId = dto.getAgentId();

        if (managerId == null || agentId == null) {
            boolean senderIsManager = senderId.toUpperCase().contains("MANAGER") 
                    || (recipientId != null && recipientId.toUpperCase().contains("AGENT"));
            managerId = senderIsManager ? senderId : recipientId;
            agentId   = senderIsManager ? recipientId : senderId;
        }

        Message message = Message.builder()
                .managerId(managerId)
                .agentId(agentId)
                .recipientId(recipientId)
                .clientMessageId(dto.getClientMessageId())
                .senderId(senderId)
                .senderName(dto.getSenderName())
                .messageType(dto.getMessageType() == null ? MessageType.TEXT : dto.getMessageType())
                .content(dto.getContent())
                .attachmentKey(dto.getAttachmentKey())
                .attachmentName(dto.getAttachmentName())
                .attachmentMime(dto.getAttachmentMime())
                .build();

        MessageDto saved;
        try {
            saved = messageMapper.toDto(messageRepository.save(message));

        } catch (DataIntegrityViolationException ex) {
            // Same clientMessageId already stored — a retry after a dropped connection.
            saved = messageMapper.toDto(messageRepository
                    .findBySenderIdAndClientMessageId(senderId, dto.getClientMessageId())
                    .orElseThrow(() -> ex));
        }

        saved.setRecipientId(recipientId);

        messagingTemplate.convertAndSendToUser(recipientId, USER_QUEUE, saved);

        return saved;
    }

    @Override
    public List<MessageDto> getConversation(String partnerId, int page, int size) {

        String currentUserId = currentUserId();

        boolean currentIsManager = currentUserId.toUpperCase().contains("MANAGER")
                || (partnerId != null && partnerId.toUpperCase().contains("AGENT"));
        String managerId = currentIsManager ? currentUserId : partnerId;
        String agentId   = currentIsManager ? partnerId : currentUserId;

        int pageSize = (size <= 0) ? DEFAULT_PAGE_SIZE : Math.min(size, MAX_PAGE_SIZE);

        List<Message> rows = messageRepository.findByManagerIdAndAgentIdOrderByIdDesc(
                managerId, agentId, PageRequest.of(Math.max(page, 0), pageSize));

        List<MessageDto> messages = new ArrayList<>(messageMapper.toDtoList(rows));
        Collections.reverse(messages);

        return messages;
    }

    private String currentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            throw new IllegalStateException("No authenticated user in context");
        }
        return authentication.getName();
    }
}

package com.my_app.schoolboard.service.impl;

import com.my_app.schoolboard.dto.MessageResponseDTO;
import com.my_app.schoolboard.exception.ResourceNotFoundException;
import com.my_app.schoolboard.model.Conversation;
import com.my_app.schoolboard.model.Message;
import com.my_app.schoolboard.model.User;
import com.my_app.schoolboard.repository.ConversationRepository;
import com.my_app.schoolboard.repository.MessageRepository;
import com.my_app.schoolboard.repository.UserRepository;
import com.my_app.schoolboard.service.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;

    private static final int MAX_MESSAGE_LENGTH = 5000;

    @Override
    @Transactional
    public MessageResponseDTO sendMessage(Long conversationId, Long senderId, String content) {
        log.debug("Sending message in conversation {} from user {}", conversationId, senderId);

        // Validate content
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("Message content cannot be empty");
        }
        if (content.length() > MAX_MESSAGE_LENGTH) {
            throw new IllegalArgumentException("Message exceeds maximum length of " + MAX_MESSAGE_LENGTH + " characters");
        }

        // Verify conversation exists
        Conversation conversation = conversationRepository.findById(conversationId)
            .orElseThrow(() -> new ResourceNotFoundException("Conversation not found with id: " + conversationId));

        // Verify sender is part of the conversation
        if (!conversation.containsUser(senderId)) {
            log.warn("User {} attempted to send message in conversation {} they don't belong to", senderId, conversationId);
            throw new IllegalArgumentException("You are not part of this conversation");
        }

        // Verify sender exists
        User sender = userRepository.findById(senderId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + senderId));

        // Create and save message
        Message message = Message.builder()
            .conversation(conversation)
            .sender(sender)
            .content(content.trim())
            .isRead(false)
            .build();

        message = messageRepository.save(message);

        // Update conversation's lastMessage and updatedAt
        conversation.setLastMessage(message);
        conversationRepository.save(conversation);

        log.info("Message sent successfully. ID: {}, ConversationID: {}, SenderID: {}", 
            message.getId(), conversationId, senderId);

        return MessageResponseDTO.fromMessage(message);
    }

    @Override
    public Page<MessageResponseDTO> getMessages(Long conversationId, Long userId, Pageable pageable) {
        log.debug("Fetching messages for conversation {} requested by user {}", conversationId, userId);

        // Verify conversation exists
        Conversation conversation = conversationRepository.findById(conversationId)
            .orElseThrow(() -> new ResourceNotFoundException("Conversation not found with id: " + conversationId));

        // Verify user is part of conversation
        if (!conversation.containsUser(userId)) {
            log.warn("User {} attempted to access messages in conversation {} they don't belong to", userId, conversationId);
            throw new IllegalArgumentException("Access denied");
        }

        Page<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtDesc(conversationId, pageable);
        return messages.map(MessageResponseDTO::fromMessage);
    }

    @Override
    public MessageResponseDTO getMessageById(Long messageId) {
        log.debug("Fetching message with ID: {}", messageId);

        Message message = messageRepository.findById(messageId)
            .orElseThrow(() -> new ResourceNotFoundException("Message not found with id: " + messageId));

        return MessageResponseDTO.fromMessage(message);
    }

    @Override
    @Transactional
    public void markAsRead(Long messageId, Long userId) {
        log.debug("Marking message {} as read by user {}", messageId, userId);

        Message message = messageRepository.findById(messageId)
            .orElseThrow(() -> new ResourceNotFoundException("Message not found with id: " + messageId));

        // Verify user is not the sender (can't mark own message as read)
        if (message.getSender().getId().equals(userId)) {
            throw new IllegalArgumentException("Cannot mark your own message as read");
        }

        // Verify user is recipient (part of conversation)
        if (!message.getConversation().containsUser(userId)) {
            throw new IllegalArgumentException("Access denied");
        }

        message.markAsRead();
        messageRepository.save(message);
        log.debug("Message {} marked as read by user {}", messageId, userId);
    }

    @Override
    @Transactional
    public void markConversationMessagesAsRead(Long conversationId, Long userId) {
        log.debug("Marking all messages in conversation {} as read for user {}", conversationId, userId);

        Conversation conversation = conversationRepository.findById(conversationId)
            .orElseThrow(() -> new ResourceNotFoundException("Conversation not found with id: " + conversationId));

        if (!conversation.containsUser(userId)) {
            throw new IllegalArgumentException("Access denied");
        }

        int updatedCount = messageRepository.markConversationMessagesAsRead(conversationId, userId);
        log.debug("Marked {} messages as read in conversation {} for user {}", updatedCount, conversationId, userId);
    }

    @Override
    @Transactional
    public void deleteMessage(Long messageId, Long userId) {
        log.debug("Deleting message {} requested by user {}", messageId, userId);

        Message message = messageRepository.findById(messageId)
            .orElseThrow(() -> new ResourceNotFoundException("Message not found with id: " + messageId));

        // Verify user is the sender
        if (!message.getSender().getId().equals(userId)) {
            log.warn("User {} attempted to delete message {} they don't own", userId, messageId);
            throw new IllegalArgumentException("You can only delete your own messages");
        }

        messageRepository.delete(message);
        log.info("Message {} deleted by user {}", messageId, userId);
    }

    @Override
    @Transactional
    public MessageResponseDTO editMessage(Long messageId, Long userId, String newContent) {
        log.debug("Editing message {} by user {}", messageId, userId);

        // Validate content
        if (newContent == null || newContent.trim().isEmpty()) {
            throw new IllegalArgumentException("Message content cannot be empty");
        }
        if (newContent.length() > MAX_MESSAGE_LENGTH) {
            throw new IllegalArgumentException("Message exceeds maximum length of " + MAX_MESSAGE_LENGTH + " characters");
        }

        Message message = messageRepository.findById(messageId)
            .orElseThrow(() -> new ResourceNotFoundException("Message not found with id: " + messageId));

        // Verify user is the sender
        if (!message.getSender().getId().equals(userId)) {
            log.warn("User {} attempted to edit message {} they don't own", userId, messageId);
            throw new IllegalArgumentException("You can only edit your own messages");
        }

        message.setContent(newContent.trim());
        message = messageRepository.save(message);

        log.info("Message {} edited by user {}", messageId, userId);
        return MessageResponseDTO.fromMessage(message);
    }

    @Override
    public Page<MessageResponseDTO> searchMessages(Long conversationId, Long userId, String keyword, Pageable pageable) {
        log.debug("Searching messages in conversation {} for keyword: {} by user {}", conversationId, keyword, userId);

        // Verify conversation exists and user is part of it
        Conversation conversation = conversationRepository.findById(conversationId)
            .orElseThrow(() -> new ResourceNotFoundException("Conversation not found with id: " + conversationId));

        if (!conversation.containsUser(userId)) {
            throw new IllegalArgumentException("Access denied");
        }

        Page<Message> messages = messageRepository.searchMessagesInConversation(conversationId, keyword, pageable);
        return messages.map(MessageResponseDTO::fromMessage);
    }
}

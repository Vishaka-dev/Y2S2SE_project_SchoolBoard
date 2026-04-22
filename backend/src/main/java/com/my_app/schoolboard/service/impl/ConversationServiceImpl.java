package com.my_app.schoolboard.service.impl;

import com.my_app.schoolboard.dto.ConversationDTO;
import com.my_app.schoolboard.dto.ConversationListItemDTO;
import com.my_app.schoolboard.dto.MessageResponseDTO;
import com.my_app.schoolboard.dto.UserBasicDTO;
import com.my_app.schoolboard.exception.ResourceNotFoundException;
import com.my_app.schoolboard.model.Conversation;
import com.my_app.schoolboard.model.Message;
import com.my_app.schoolboard.model.User;
import com.my_app.schoolboard.repository.ConversationRepository;
import com.my_app.schoolboard.repository.MessageRepository;
import com.my_app.schoolboard.repository.UserRepository;
import com.my_app.schoolboard.service.ConversationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class ConversationServiceImpl implements ConversationService {

    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final MessageRepository messageRepository;

    @Override
    @Transactional
    public Conversation getOrCreateConversation(Long userId1, Long userId2) {
        log.debug("Getting or creating conversation between user {} and user {}", userId1, userId2);

        // Validate users are different
        if (userId1.equals(userId2)) {
            throw new IllegalArgumentException("Cannot create conversation with yourself");
        }

        // Normalize user IDs (ensure user1 < user2)
        Long minUserId = Math.min(userId1, userId2);
        Long maxUserId = Math.max(userId1, userId2);

        // Check if conversation already exists
        return conversationRepository
            .findConversationBetweenUsers(minUserId, maxUserId)
            .orElseGet(() -> createNewConversation(minUserId, maxUserId));
    }

    private Conversation createNewConversation(Long userId1, Long userId2) {
        User user1 = userRepository.findById(userId1)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId1));
        User user2 = userRepository.findById(userId2)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId2));

        Conversation conversation = Conversation.builder()
            .user1(user1)
            .user2(user2)
            .build();

        Conversation saved = conversationRepository.save(conversation);
        log.info("Created new conversation with ID: {} between user {} and user {}", 
            saved.getId(), userId1, userId2);
        return saved;
    }

    @Override
    public Page<ConversationListItemDTO> getUserConversations(Long userId, Pageable pageable) {
        log.debug("Fetching conversations for user {}", userId);

        // Verify user exists
        userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Page<Conversation> conversations = conversationRepository
            .findUserConversationsWithLastMessage(userId, pageable);

        return conversations.map(conv -> buildConversationListItem(conv, userId));
    }

    @Override
    public ConversationDTO getConversationWithMessages(Long conversationId, Long userId, Pageable messagePaging) {
        log.debug("Fetching conversation {} with messages for user {}", conversationId, userId);

        Conversation conversation = conversationRepository.findById(conversationId)
            .orElseThrow(() -> new ResourceNotFoundException("Conversation not found with id: " + conversationId));

        // Verify user is part of this conversation
        if (!conversation.containsUser(userId)) {
            log.warn("User {} attempted to access conversation {} they don't belong to", userId, conversationId);
            throw new IllegalArgumentException("Access denied: You are not part of this conversation");
        }

        // Mark all unread messages as read for this user
        messageRepository.markConversationMessagesAsRead(conversationId, userId);

        // Fetch paginated messages (newest first)
        Page<Message> messages = messageRepository
            .findByConversationIdOrderByCreatedAtDesc(conversationId, messagePaging);

        // Convert to DTO
        ConversationDTO dto = ConversationDTO.builder()
            .id(conversation.getId())
            .user1(UserBasicDTO.fromUser(conversation.getUser1()))
            .user2(UserBasicDTO.fromUser(conversation.getUser2()))
            .lastMessage(MessageResponseDTO.fromMessage(conversation.getLastMessage()))
            .messages(messages.getContent().stream()
                .map(MessageResponseDTO::fromMessage)
                .collect(Collectors.toList()))
            .unreadCount(0) // Already marked as read above
            .createdAt(conversation.getCreatedAt())
            .updatedAt(conversation.getUpdatedAt())
            .build();

        log.debug("Successfully fetched conversation {} with {} messages", conversationId, messages.getNumberOfElements());
        return dto;
    }

    @Override
    @Transactional
    public void deleteConversation(Long conversationId, Long userId) {
        log.debug("Deleting conversation {} for user {}", conversationId, userId);

        Conversation conversation = conversationRepository.findById(conversationId)
            .orElseThrow(() -> new ResourceNotFoundException("Conversation not found with id: " + conversationId));

        if (!conversation.containsUser(userId)) {
            log.warn("User {} attempted to delete conversation {} they don't belong to", userId, conversationId);
            throw new IllegalArgumentException("Cannot delete this conversation");
        }

        conversationRepository.delete(conversation);
        log.info("Conversation {} deleted by user {}", conversationId, userId);
    }

    @Override
    @Transactional
    public void markConversationAsRead(Long conversationId, Long userId) {
        log.debug("Marking conversation {} as read for user {}", conversationId, userId);

        Conversation conversation = conversationRepository.findById(conversationId)
            .orElseThrow(() -> new ResourceNotFoundException("Conversation not found with id: " + conversationId));

        if (!conversation.containsUser(userId)) {
            throw new IllegalArgumentException("Access denied");
        }

        messageRepository.markConversationMessagesAsRead(conversationId, userId);
        log.debug("Marked conversation {} as read for user {}", conversationId, userId);
    }

    @Override
    public Page<ConversationListItemDTO> searchConversations(Long userId, String keyword, Pageable pageable) {
        log.debug("Searching conversations for user {} with keyword: {}", userId, keyword);

        userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Page<Conversation> conversations = conversationRepository
            .searchUserConversations(userId, keyword, pageable);

        return conversations.map(conv -> buildConversationListItem(conv, userId));
    }

    @Override
    public Integer getTotalUnreadCount(Long userId) {
        return messageRepository.countTotalUnreadMessages(userId);
    }

    private ConversationListItemDTO buildConversationListItem(Conversation conversation, Long currentUserId) {
        User otherUser = conversation.getOtherUser(currentUserId);
        Integer unreadCount = messageRepository.countUnreadMessagesForUser(conversation.getId(), currentUserId);

        String lastMessagePreview = ConversationListItemDTO
            .getMessagePreview(conversation.getLastMessage() != null ? conversation.getLastMessage().getContent() : null);

        return ConversationListItemDTO.builder()
            .id(conversation.getId())
            .otherUser(UserBasicDTO.fromUser(otherUser))
            .lastMessagePreview(lastMessagePreview)
            .lastMessageTime(conversation.getUpdatedAt())
            .unreadCount(unreadCount)
            .updatedAt(conversation.getUpdatedAt())
            .build();
    }
}

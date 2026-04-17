package com.my_app.schoolboard.service;

import com.my_app.schoolboard.dto.ConversationDTO;
import com.my_app.schoolboard.dto.ConversationListItemDTO;
import com.my_app.schoolboard.model.Conversation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ConversationService {

    /**
     * Get or create a conversation between two users
     */
    Conversation getOrCreateConversation(Long userId1, Long userId2);

    /**
     * Get all conversations for a user (paginated)
     */
    Page<ConversationListItemDTO> getUserConversations(Long userId, Pageable pageable);

    /**
     * Get conversation with full message history
     */
    ConversationDTO getConversationWithMessages(Long conversationId, Long userId, Pageable messagePaging);

    /**
     * Delete a conversation
     */
    void deleteConversation(Long conversationId, Long userId);

    /**
     * Mark conversation as read
     */
    void markConversationAsRead(Long conversationId, Long userId);

    /**
     * Search conversations by keyword (username or email of other user)
     */
    Page<ConversationListItemDTO> searchConversations(Long userId, String keyword, Pageable pageable);

    /**
     * Get total unread message count for a user
     */
    Integer getTotalUnreadCount(Long userId);
}

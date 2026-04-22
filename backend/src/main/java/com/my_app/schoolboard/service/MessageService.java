package com.my_app.schoolboard.service;

import com.my_app.schoolboard.dto.MessageRequestDTO;
import com.my_app.schoolboard.dto.MessageResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MessageService {

    /**
     * Send a message in a conversation
     */
    MessageResponseDTO sendMessage(Long conversationId, Long senderId, String content);

    /**
     * Get messages from a conversation (paginated, newest first)
     */
    Page<MessageResponseDTO> getMessages(Long conversationId, Long userId, Pageable pageable);

    /**
     * Get a single message by ID
     */
    MessageResponseDTO getMessageById(Long messageId);

    /**
     * Mark a message as read
     */
    void markAsRead(Long messageId, Long userId);

    /**
     * Mark all messages in a conversation as read for a user
     */
    void markConversationMessagesAsRead(Long conversationId, Long userId);

    /**
     * Delete a message
     */
    void deleteMessage(Long messageId, Long userId);

    /**
     * Edit/update a message content
     */
    MessageResponseDTO editMessage(Long messageId, Long userId, String newContent);

    /**
     * Search messages in a conversation by keyword
     */
    Page<MessageResponseDTO> searchMessages(Long conversationId, Long userId, String keyword, Pageable pageable);
}

package com.my_app.schoolboard.service;

import com.my_app.schoolboard.dto.GroupMessageResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

/**
 * Service interface for group message operations
 */
public interface GroupMessageService {

    /**
     * Send a message in a group conversation
     */
    GroupMessageResponseDTO sendMessage(Long groupConversationId, Long senderId, String content);

    /**
     * Fetch messages for a group conversation (paginated)
     */
    Page<GroupMessageResponseDTO> fetchMessages(Long groupConversationId, Pageable pageable);

    /**
     * Get a single group message
     */
    GroupMessageResponseDTO getMessageById(Long messageId);

    /**
     * Delete a group message
     */
    void deleteMessage(Long messageId, Long userId);

    /**
     * Upload attachment to a message
     */
    GroupMessageResponseDTO uploadAttachment(Long messageId, MultipartFile file);

    /**
     * Mark message as read
     */
    void markAsRead(Long messageId);

    /**
     * Count unread messages in a group conversation for a user
     */
    long countUnreadMessages(Long groupConversationId, Long userId);
}

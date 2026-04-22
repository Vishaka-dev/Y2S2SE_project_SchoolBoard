package com.my_app.schoolboard.service;

import com.my_app.schoolboard.dto.GroupConversationResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service interface for group conversation operations
 */
public interface GroupConversationService {

    /**
     * Get or create a group conversation for a group
     */
    GroupConversationResponseDTO getOrCreateGroupConversation(Long groupId, String username);

    /**
     * Get group conversation by ID
     */
    GroupConversationResponseDTO getGroupConversation(Long conversationId);

    /**
     * Fetch all group conversations for the current user (paginated)
     */
    Page<GroupConversationResponseDTO> getUserGroupConversations(String username, Pageable pageable);

    /**
     * Get group conversation detail with member count
     */
    GroupConversationResponseDTO getGroupConversationDetail(Long groupId);
}

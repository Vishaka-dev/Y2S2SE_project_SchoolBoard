package com.my_app.schoolboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationDTO {
    private Long id;
    private UserBasicDTO user1;
    private UserBasicDTO user2;
    private MessageResponseDTO lastMessage;
    private List<MessageResponseDTO> messages;
    private Integer unreadCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Get the other user in the conversation (from current user's perspective)
     * This is a helper method that can be called from services.
     */
    public UserBasicDTO getOtherUser(Long currentUserId) {
        if (user1 != null && user1.getId().equals(currentUserId)) {
            return user2;
        } else if (user2 != null && user2.getId().equals(currentUserId)) {
            return user1;
        }
        return null;
    }
}

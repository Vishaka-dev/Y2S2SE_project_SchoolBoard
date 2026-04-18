package com.my_app.schoolboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationListItemDTO {
    private Long id;
    private UserBasicDTO otherUser;
    private String lastMessagePreview;
    private LocalDateTime lastMessageTime;
    private Integer unreadCount;
    private LocalDateTime updatedAt;

    /**
     * Helper method to truncate message preview to 50 characters
     */
    public static String getMessagePreview(String fullMessage) {
        if (fullMessage == null) {
            return "(No messages yet)";
        }
        if (fullMessage.length() > 50) {
            return fullMessage.substring(0, 50) + "...";
        }
        return fullMessage;
    }
}

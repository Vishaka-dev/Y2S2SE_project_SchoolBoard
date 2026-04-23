package com.my_app.schoolboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * WebSocket Event for typing indicators in group chats
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupTypingIndicatorEvent {
    private Long groupId;
    private Long userId;
    private String username;
    private Boolean isTyping;
}

package com.my_app.schoolboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * WebSocket Event for incoming group messages
 * Client sends this to /app/group-chat.send
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupChatMessageEvent {
    private Long groupId;
    private Long senderId;
    private String content;
    private LocalDateTime timestamp;
}

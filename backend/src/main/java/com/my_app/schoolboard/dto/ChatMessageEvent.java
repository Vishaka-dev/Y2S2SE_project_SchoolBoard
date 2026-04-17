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
public class ChatMessageEvent {
    private Long conversationId;
    private Long senderId;
    private String content;
    private LocalDateTime timestamp;
}

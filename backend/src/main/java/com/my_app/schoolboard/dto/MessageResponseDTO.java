package com.my_app.schoolboard.dto;

import com.my_app.schoolboard.model.Message;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponseDTO {
    private Long id;
    private Long conversationId;
    private UserBasicDTO sender;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean isRead;
    private LocalDateTime readAt;

    /**
     * Convert Message entity to MessageResponseDTO
     */
    public static MessageResponseDTO fromMessage(Message message) {
        if (message == null) {
            return null;
        }
        return MessageResponseDTO.builder()
            .id(message.getId())
            .conversationId(message.getConversation().getId())
            .sender(UserBasicDTO.fromUser(message.getSender()))
            .content(message.getContent())
            .createdAt(message.getCreatedAt())
            .updatedAt(message.getUpdatedAt())
            .isRead(message.getIsRead())
            .readAt(message.getReadAt())
            .build();
    }
}

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
public class ChatMessageResponseEvent {
    private Long id;
    private Long conversationId;
    private Long senderId;
    private String senderUsername;
    private String content;
    private LocalDateTime createdAt;
    private Boolean isRead;
    
    /**
     * Convert MessageResponseDTO to ChatMessageResponseEvent for WebSocket
     */
    public static ChatMessageResponseEvent fromMessageDTO(MessageResponseDTO messageDTO) {
        if (messageDTO == null) {
            return null;
        }
        return ChatMessageResponseEvent.builder()
            .id(messageDTO.getId())
            .conversationId(messageDTO.getConversationId())
            .senderId(messageDTO.getSender().getId())
            .senderUsername(messageDTO.getSender().getUsername())
            .content(messageDTO.getContent())
            .createdAt(messageDTO.getCreatedAt())
            .isRead(messageDTO.getIsRead())
            .build();
    }
}

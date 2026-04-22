package com.my_app.schoolboard.dto;

import com.my_app.schoolboard.model.GroupMessage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Group Message Response DTO
 * Used for API responses
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupMessageResponseDTO {
    private Long id;
    private Long groupConversationId;
    private UserDto sender;
    private String content;
    private List<GroupAttachmentDTO> attachments;
    private Boolean isRead;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static GroupMessageResponseDTO fromGroupMessage(GroupMessage message) {
        if (message == null) return null;
        
        return GroupMessageResponseDTO.builder()
                .id(message.getId())
                .groupConversationId(message.getGroupConversation().getId())
                .sender(UserDto.fromUser(message.getSender()))
                .content(message.getContent())
                .attachments(message.getAttachments().stream()
                        .map(GroupAttachmentDTO::fromAttachment)
                        .collect(Collectors.toList()))
                .isRead(message.getIsRead())
                .createdAt(message.getCreatedAt())
                .updatedAt(message.getUpdatedAt())
                .build();
    }
}

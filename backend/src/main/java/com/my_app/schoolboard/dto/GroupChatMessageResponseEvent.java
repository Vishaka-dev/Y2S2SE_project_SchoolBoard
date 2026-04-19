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
 * WebSocket Event for outgoing group messages
 * Server broadcasts this to /topic/group-chat.{groupId}
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupChatMessageResponseEvent {
    private Long id;
    private Long groupId;
    private Long groupConversationId;
    private Long senderId;
    private String senderUsername;
    private String senderProfileImageUrl;
    private String content;
    private List<GroupAttachmentDTO> attachments;
    private Boolean isRead;
    private LocalDateTime createdAt;

    public static GroupChatMessageResponseEvent fromGroupMessage(GroupMessage message) {
        if (message == null) return null;

        return GroupChatMessageResponseEvent.builder()
                .id(message.getId())
                .groupId(message.getGroupConversation().getGroup().getId())
                .groupConversationId(message.getGroupConversation().getId())
                .senderId(message.getSender().getId())
                .senderUsername(message.getSender().getUsername())
                .senderProfileImageUrl(message.getSender().getProfileImageUrl())
                .content(message.getContent())
                .attachments(message.getAttachments().stream()
                        .map(GroupAttachmentDTO::fromAttachment)
                        .collect(Collectors.toList()))
                .isRead(message.getIsRead())
                .createdAt(message.getCreatedAt())
                .build();
    }
}

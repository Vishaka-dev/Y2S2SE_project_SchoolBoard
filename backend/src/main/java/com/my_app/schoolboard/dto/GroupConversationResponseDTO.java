package com.my_app.schoolboard.dto;

import com.my_app.schoolboard.model.GroupConversation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Group Conversation Response DTO
 * Used for listing conversations in Messages page
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupConversationResponseDTO {
    private Long id;
    private Long groupId;
    private String groupName;
    private String groupProfilePictureUrl;
    private GroupMessageResponseDTO lastMessage;
    private Long memberCount;
    private LocalDateTime updatedAt;
    private String type;  // "GROUP" to distinguish from personal conversations

    public static GroupConversationResponseDTO fromGroupConversation(GroupConversation conversation, Long memberCount) {
        if (conversation == null) return null;
        
        return GroupConversationResponseDTO.builder()
                .id(conversation.getId())
                .groupId(conversation.getGroup().getId())
                .groupName(conversation.getGroup().getName())
                .groupProfilePictureUrl(conversation.getGroup().getPicture() != null ? 
                        conversation.getGroup().getPicture().getProfilePictureUrl() : null)
                .lastMessage(conversation.getLastMessage() != null ? 
                        GroupMessageResponseDTO.fromGroupMessage(conversation.getLastMessage()) : null)
                .memberCount(memberCount)
                .updatedAt(conversation.getUpdatedAt())
                .type("GROUP")
                .build();
    }
}

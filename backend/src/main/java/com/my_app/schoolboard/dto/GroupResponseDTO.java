package com.my_app.schoolboard.dto;

import java.time.LocalDateTime;

import com.my_app.schoolboard.model.GroupMemberRole;
import com.my_app.schoolboard.model.GroupType;
import com.my_app.schoolboard.model.GroupVisibility;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupResponseDTO {
    private Long id;
    private String name;
    private String description;
    private GroupType groupType;
    private String subject;
    private String academicLevel;
    private String imageUrl;
    private GroupVisibility visibility;
    private CreatorDTO creator;
    private Long memberCount;
    private boolean joined;
    private GroupMemberRole currentUserRole;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreatorDTO {
        private Long id;
        private String username;
        private String displayName;
        private String profileImageUrl;
    }
}

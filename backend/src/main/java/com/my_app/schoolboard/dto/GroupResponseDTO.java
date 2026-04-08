package com.my_app.schoolboard.dto;

import com.my_app.schoolboard.model.GroupMemberRole;
import com.my_app.schoolboard.model.GroupType;
import com.my_app.schoolboard.model.GroupVisibility;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for group details
 */
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
    private Long creatorId;
    private String creatorUsername;
    private String creatorProfileImageUrl;
    private long memberCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * The requesting user's role in this group (null if not a member)
     */
    private GroupMemberRole currentUserRole;
}

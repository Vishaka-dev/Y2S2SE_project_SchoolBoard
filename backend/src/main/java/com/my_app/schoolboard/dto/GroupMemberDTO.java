package com.my_app.schoolboard.dto;

import java.time.LocalDateTime;

import com.my_app.schoolboard.model.GroupMemberRole;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupMemberDTO {
    private Long userId;
    private String username;
    private String displayName;
    private String profileImageUrl;
    private GroupMemberRole role;
    private LocalDateTime joinedAt;
}

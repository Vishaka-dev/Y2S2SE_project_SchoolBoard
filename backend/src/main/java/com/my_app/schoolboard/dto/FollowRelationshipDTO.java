package com.my_app.schoolboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FollowRelationshipDTO {
    private boolean isFollowing;
    private boolean isFollowedBy;
    private boolean isMutual;
}

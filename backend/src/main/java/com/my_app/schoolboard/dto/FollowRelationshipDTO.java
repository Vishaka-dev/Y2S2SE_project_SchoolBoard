package com.my_app.schoolboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.fasterxml.jackson.annotation.JsonProperty;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FollowRelationshipDTO {
    @JsonProperty("isFollowing")
    private boolean isFollowing;
    @JsonProperty("isFollowedBy")
    private boolean isFollowedBy;
    @JsonProperty("isMutual")
    private boolean isMutual;
}

package com.my_app.schoolboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostResponseDTO {
    private Long id;
    private String content;
    private String imageUrl;
    private AuthorDTO author;
    private Set<String> hashtags;
    private LocalDateTime createdAt;
    private Long likeCount;
    @com.fasterxml.jackson.annotation.JsonProperty("isLiked")
    private Boolean isLiked;
    private Long commentCount;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuthorDTO {
        private Long id;
        private String name;
        private String role;
        private String avatar;
        private String initials;
        private String username;
        @com.fasterxml.jackson.annotation.JsonProperty("isFollowing")
        private Boolean isFollowing;
        @com.fasterxml.jackson.annotation.JsonProperty("isMutual")
        private Boolean isMutual;
    }
}

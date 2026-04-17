package com.my_app.schoolboard.dto;

import com.my_app.schoolboard.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserBasicDTO {
    private Long id;
    private String username;
    private String displayName;
    private String profileImageUrl;

    /**
     * Convert User entity to UserBasicDTO
     */
    public static UserBasicDTO fromUser(User user) {
        if (user == null) {
            return null;
        }
        return UserBasicDTO.builder()
            .id(user.getId())
            .username(user.getUsername())
            .displayName(user.getUsername()) // Use username as display name (can be enhanced with actual display name field)
            .profileImageUrl(user.getProfileImageUrl())
            .build();
    }
}

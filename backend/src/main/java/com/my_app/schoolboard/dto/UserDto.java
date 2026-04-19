package com.my_app.schoolboard.dto;

import com.my_app.schoolboard.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Sender info DTO for group messages
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String username;
    private String profileImageUrl;
    private String firstName;
    private String lastName;

    public static UserDto fromUser(User user) {
        if (user == null) return null;
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .profileImageUrl(user.getProfileImageUrl())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .build();
    }
}

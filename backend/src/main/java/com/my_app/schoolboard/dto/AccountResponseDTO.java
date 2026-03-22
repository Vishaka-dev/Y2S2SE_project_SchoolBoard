package com.my_app.schoolboard.dto;

import com.my_app.schoolboard.model.AuthProvider;
import com.my_app.schoolboard.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for account response containing user details and profile information
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountResponseDTO {

    private Long id;
    private String email;
    private String username;
    private String fullName; // Extracted from profile for convenience
    private Role role;
    private AuthProvider provider;
    private LocalDateTime createdAt;
    private String imageUrl;

    // Profile data - only populated based on role
    private Object profile;
}

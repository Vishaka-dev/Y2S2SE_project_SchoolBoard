package com.my_app.schoolboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for profile image upload
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileImageUploadResponseDTO {

    private String profileImageUrl;
    private String message;
}

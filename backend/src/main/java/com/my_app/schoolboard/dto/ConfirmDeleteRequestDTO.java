package com.my_app.schoolboard.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for confirming account deletion using a token
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConfirmDeleteRequestDTO {

    @NotBlank(message = "Delete token is required")
    private String token;
}

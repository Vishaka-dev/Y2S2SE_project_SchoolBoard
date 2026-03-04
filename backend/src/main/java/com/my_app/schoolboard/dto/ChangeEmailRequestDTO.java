package com.my_app.schoolboard.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for email change request
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChangeEmailRequestDTO {

    @NotBlank(message = "New email is required")
    @Email(message = "Email must be valid")
    private String newEmail;

    @NotBlank(message = "Password is required to confirm email change")
    private String password;
}

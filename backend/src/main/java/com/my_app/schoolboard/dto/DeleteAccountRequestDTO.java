package com.my_app.schoolboard.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for account deletion request
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeleteAccountRequestDTO {

    @NotBlank(message = "Password is required to confirm account deletion")
    private String password;
}

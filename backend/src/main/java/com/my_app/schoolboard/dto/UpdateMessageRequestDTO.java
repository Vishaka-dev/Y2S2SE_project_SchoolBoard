package com.my_app.schoolboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateMessageRequestDTO {

    @NotBlank(message = "Message content cannot be empty")
    @Size(min = 1, max = 5000, message = "Message must be between 1 and 5000 characters")
    private String content;
}

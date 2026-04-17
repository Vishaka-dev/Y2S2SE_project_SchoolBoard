package com.my_app.schoolboard.dto;

import com.my_app.schoolboard.model.GroupType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for updating an existing group.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateGroupRequestDTO {

    @NotBlank(message = "Group name is required")
    @Size(min = 2, max = 100, message = "Group name must be between 2 and 100 characters")
    private String name;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @NotNull(message = "Group type is required")
    private GroupType groupType;

    @Size(max = 100, message = "Subject must not exceed 100 characters")
    private String subject;

    @Size(max = 50, message = "Academic level must not exceed 50 characters")
    private String academicLevel;

    /**
     * Optional image removal flag. If true and no new image is uploaded,
     * the current image is removed.
     */
    private Boolean removeImage;
}

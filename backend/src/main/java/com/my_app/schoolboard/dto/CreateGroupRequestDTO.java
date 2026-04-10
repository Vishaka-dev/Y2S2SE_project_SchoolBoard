package com.my_app.schoolboard.dto;

import com.my_app.schoolboard.model.GroupType;
import com.my_app.schoolboard.model.GroupVisibility;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateGroupRequestDTO {

    @NotBlank(message = "Group name is required")
    @Size(max = 150, message = "Group name must not exceed 150 characters")
    private String name;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    @NotNull(message = "Group type is required")
    private GroupType groupType;

    @NotBlank(message = "Subject is required")
    @Size(max = 120, message = "Subject must not exceed 120 characters")
    private String subject;

    @NotBlank(message = "Academic level is required")
    @Size(max = 120, message = "Academic level must not exceed 120 characters")
    private String academicLevel;

    private String imageUrl;

    @Builder.Default
    private GroupVisibility visibility = GroupVisibility.PUBLIC;
}

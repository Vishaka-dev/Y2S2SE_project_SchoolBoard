package com.my_app.schoolboard.dto;

import com.my_app.schoolboard.model.ResourceCategory;
import com.my_app.schoolboard.model.ResourceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.URL;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResourceCreateRequestDTO {

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must be at most 255 characters")
    private String title;

    @Size(max = 5000, message = "Description must be at most 5000 characters")
    private String description;

    @NotNull(message = "Type is required")
    private ResourceType type;

    @NotNull(message = "Category is required")
    private ResourceCategory category;

    private MultipartFile file;

    @URL(message = "External URL must be a valid URL")
    @Size(max = 1000, message = "External URL must be at most 1000 characters")
    private String externalUrl;

    private Long groupId;

    private List<String> tags;
}

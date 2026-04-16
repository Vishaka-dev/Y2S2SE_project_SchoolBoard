package com.my_app.schoolboard.dto;

import com.my_app.schoolboard.model.ResourceCategory;
import com.my_app.schoolboard.model.ResourceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResourceResponseDTO {

    private Long id;
    private String title;
    private String description;
    private ResourceType type;
    private ResourceCategory category;
    private String fileUrl;
    private String externalUrl;
    private UploaderDTO uploadedBy;
    private LocalDateTime createdAt;
    private Set<String> tags;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UploaderDTO {
        private Long id;
        private String username;
        private String role;
        private String avatar;
    }
}

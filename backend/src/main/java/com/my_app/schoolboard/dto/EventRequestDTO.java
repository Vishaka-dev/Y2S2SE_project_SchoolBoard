package com.my_app.schoolboard.dto;

import com.my_app.schoolboard.model.EventCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventRequestDTO {
    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Event date is required")
    private LocalDateTime eventDate;

    @NotBlank(message = "Location is required")
    private String location;

    @NotNull(message = "Category is required")
    private EventCategory category;

    private String bannerImageUrl;
}

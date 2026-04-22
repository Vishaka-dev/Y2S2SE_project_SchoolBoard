package com.my_app.schoolboard.strategy;

import com.my_app.schoolboard.dto.CreateGroupRequestDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Group type behavior for COURSE groups.
 * Course groups emphasize subject/module information.
 */
@Component
@Slf4j
public class CourseGroupBehavior implements GroupTypeBehavior {

    @Override
    public void validateMetadata(CreateGroupRequestDTO request) {
        log.debug("Validating COURSE group metadata");

        if (request.getSubject() == null || request.getSubject().isBlank()) {
            throw new IllegalArgumentException("Subject is required for Course groups");
        }
    }

    @Override
    public List<String> getRequiredFields() {
        return List.of("subject", "academicLevel");
    }

    @Override
    public String getDisplayLabel() {
        return "Course Group";
    }
}

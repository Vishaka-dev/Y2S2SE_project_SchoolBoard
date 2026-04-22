package com.my_app.schoolboard.strategy;

import com.my_app.schoolboard.dto.CreateGroupRequestDTO;
import com.my_app.schoolboard.model.GroupType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * Default group type behavior shared by group types that
 * do not require specialized validation in V1.
 *
 * Supports: BATCH, STUDY_GROUP, PROJECT, EXAM_PREP, CLUB, MENTORSHIP
 *
 * When a specific group type needs custom behavior in the future,
 * create a dedicated implementation and register it in the factory.
 */
@Component
@Slf4j
public class DefaultGroupBehavior implements GroupTypeBehavior {

    private static final Map<GroupType, String> DISPLAY_LABELS = Map.of(
            GroupType.BATCH, "Batch Group",
            GroupType.STUDY_GROUP, "Study Group",
            GroupType.PROJECT, "Project Group",
            GroupType.EXAM_PREP, "Exam Prep Group",
            GroupType.CLUB, "Club / Community",
            GroupType.MENTORSHIP, "Mentorship Group"
    );

    /**
     * Tracks which group type this instance is serving.
     * Set by the factory when resolving.
     */
    private final ThreadLocal<GroupType> currentType = new ThreadLocal<>();

    public void setCurrentType(GroupType type) {
        this.currentType.set(type);
    }

    @Override
    public void validateMetadata(CreateGroupRequestDTO request) {
        log.debug("Validating metadata for group type: {} (default behavior)", currentType.get());
        // No additional validation required for default group types in V1
    }

    @Override
    public List<String> getRequiredFields() {
        return List.of();
    }

    @Override
    public String getDisplayLabel() {
        GroupType type = currentType.get();
        return type != null ? DISPLAY_LABELS.getOrDefault(type, "Group") : "Group";
    }
}

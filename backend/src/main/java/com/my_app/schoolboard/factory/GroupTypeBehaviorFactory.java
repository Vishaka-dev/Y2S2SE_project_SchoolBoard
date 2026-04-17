package com.my_app.schoolboard.factory;

import com.my_app.schoolboard.model.GroupType;
import com.my_app.schoolboard.strategy.CourseGroupBehavior;
import com.my_app.schoolboard.strategy.DefaultGroupBehavior;
import com.my_app.schoolboard.strategy.GroupTypeBehavior;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Factory for resolving GroupTypeBehavior based on GroupType.
 * Follows Factory Pattern and mirrors RegistrationStrategyFactory.
 *
 * To add a new group type behavior:
 * 1. Create a new class implementing GroupTypeBehavior
 * 2. Add a case in the switch below
 */
@Component
@RequiredArgsConstructor
public class GroupTypeBehaviorFactory {

    private final CourseGroupBehavior courseGroupBehavior;
    private final DefaultGroupBehavior defaultGroupBehavior;

    /**
     * Returns the appropriate behavior strategy for the given group type.
     *
     * @param groupType The group type
     * @return The corresponding GroupTypeBehavior implementation
     */
    public GroupTypeBehavior getBehavior(GroupType groupType) {
        return switch (groupType) {
            case COURSE -> courseGroupBehavior;
            case BATCH, STUDY_GROUP, PROJECT, EXAM_PREP, CLUB, MENTORSHIP -> {
                defaultGroupBehavior.setCurrentType(groupType);
                yield defaultGroupBehavior;
            }
        };
    }
}

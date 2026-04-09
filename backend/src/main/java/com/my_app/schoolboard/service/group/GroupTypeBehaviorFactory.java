package com.my_app.schoolboard.service.group;

import java.util.List;

import org.springframework.stereotype.Component;

import com.my_app.schoolboard.model.GroupType;

@Component
public class GroupTypeBehaviorFactory {

    private final List<GroupTypeBehavior> behaviors;

    public GroupTypeBehaviorFactory(List<GroupTypeBehavior> behaviors) {
        this.behaviors = behaviors;
    }

    public GroupTypeBehavior getBehavior(GroupType groupType) {
        return behaviors.stream()
                .filter(behavior -> behavior.supports(groupType))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unsupported group type: " + groupType));
    }
}

package com.my_app.schoolboard.service.group;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import com.my_app.schoolboard.dto.CreateGroupRequestDTO;
import com.my_app.schoolboard.model.GroupType;

@Component
@Order(Ordered.LOWEST_PRECEDENCE)
public class DefaultGroupTypeBehavior implements GroupTypeBehavior {

    @Override
    public boolean supports(GroupType groupType) {
        return true;
    }

    @Override
    public void validateCreateRequest(CreateGroupRequestDTO request) {
        // Default no-op behavior. Specific group types can override this later.
    }
}

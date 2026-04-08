package com.my_app.schoolboard.service.group;

import com.my_app.schoolboard.dto.CreateGroupRequestDTO;
import com.my_app.schoolboard.model.GroupType;

public interface GroupTypeBehavior {
    boolean supports(GroupType groupType);

    void validateCreateRequest(CreateGroupRequestDTO request);
}

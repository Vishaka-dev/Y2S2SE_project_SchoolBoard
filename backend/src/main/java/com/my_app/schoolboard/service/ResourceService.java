package com.my_app.schoolboard.service;

import com.my_app.schoolboard.dto.ResourceCreateRequestDTO;
import com.my_app.schoolboard.dto.ResourcePageDTO;
import com.my_app.schoolboard.dto.ResourceResponseDTO;
import com.my_app.schoolboard.model.ResourceCategory;
import com.my_app.schoolboard.model.ResourceType;
import com.my_app.schoolboard.model.Role;

public interface ResourceService {

    ResourceResponseDTO createResource(ResourceCreateRequestDTO request, String username);

    ResourcePageDTO getResources(int page, int size, ResourceCategory category, ResourceType type, String search,
            Role role, Long groupId);

    void deleteResource(Long id, String username);
}

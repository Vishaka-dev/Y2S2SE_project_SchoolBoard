package com.my_app.schoolboard.service;

import com.my_app.schoolboard.dto.CreateGroupRequestDTO;
import com.my_app.schoolboard.dto.GroupMemberDTO;
import com.my_app.schoolboard.dto.GroupResponseDTO;

import java.util.List;

/**
 * Service interface for group operations
 */
public interface GroupService {

    GroupResponseDTO createGroup(CreateGroupRequestDTO request, String username);

    GroupResponseDTO getGroupById(Long groupId, String username);

    List<GroupResponseDTO> getAllGroups(String username);

    List<GroupResponseDTO> getMyGroups(String username);

    void joinGroup(Long groupId, String username);

    void leaveGroup(Long groupId, String username);

    List<GroupMemberDTO> getGroupMembers(Long groupId);

    List<GroupResponseDTO> searchGroups(String keyword, String username);
}

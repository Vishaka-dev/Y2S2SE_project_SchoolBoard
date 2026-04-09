package com.my_app.schoolboard.service;

import java.util.List;

import com.my_app.schoolboard.dto.CreateGroupRequestDTO;
import com.my_app.schoolboard.dto.GroupMemberDTO;
import com.my_app.schoolboard.dto.GroupResponseDTO;

public interface GroupService {
    GroupResponseDTO createGroup(CreateGroupRequestDTO request, String username);

    GroupResponseDTO getGroupById(Long groupId, String username);

    List<GroupResponseDTO> getGroups(String username);

    List<GroupResponseDTO> filterGroupsByCategory(String category, String username);

    List<GroupResponseDTO> getMyGroups(String username);

    void joinGroup(Long groupId, String username);

    void leaveGroup(Long groupId, String username);

    List<GroupMemberDTO> getGroupMembers(Long groupId, String username);
    List<GroupResponseDTO> searchGroups(String keyword, String username);
}

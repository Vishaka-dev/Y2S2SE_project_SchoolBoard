package com.my_app.schoolboard.service.impl;

import com.my_app.schoolboard.dto.CreateGroupRequestDTO;
import com.my_app.schoolboard.dto.GroupMemberDTO;
import com.my_app.schoolboard.dto.GroupResponseDTO;
import com.my_app.schoolboard.exception.ResourceNotFoundException;
import com.my_app.schoolboard.factory.GroupTypeBehaviorFactory;
import com.my_app.schoolboard.model.*;
import com.my_app.schoolboard.repository.GroupMemberRepository;
import com.my_app.schoolboard.repository.StudyGroupRepository;
import com.my_app.schoolboard.repository.UserRepository;
import com.my_app.schoolboard.service.GroupService;
import com.my_app.schoolboard.strategy.GroupTypeBehavior;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class GroupServiceImpl implements GroupService {

    private final StudyGroupRepository studyGroupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;
    private final GroupTypeBehaviorFactory groupTypeBehaviorFactory;

    @Override
    @Transactional
    public GroupResponseDTO createGroup(CreateGroupRequestDTO request, String username) {
        log.info("Creating group '{}' of type {} by user: {}", request.getName(), request.getGroupType(), username);

        User creator = findUserByUsername(username);

        // Validate group-type-specific metadata via strategy
        GroupTypeBehavior behavior = groupTypeBehaviorFactory.getBehavior(request.getGroupType());
        behavior.validateMetadata(request);

        // Build and save the group entity
        StudyGroup group = StudyGroup.builder()
                .name(request.getName())
                .description(request.getDescription())
                .groupType(request.getGroupType())
                .subject(request.getSubject())
                .academicLevel(request.getAcademicLevel())
                .imageUrl(request.getImageUrl())
                .visibility(GroupVisibility.PUBLIC)
                .createdBy(creator)
                .build();

        group = studyGroupRepository.save(group);

        // Auto-add creator as OWNER
        GroupMember ownerMember = GroupMember.builder()
                .group(group)
                .user(creator)
                .role(GroupMemberRole.OWNER)
                .build();

        groupMemberRepository.save(ownerMember);

        log.info("Group '{}' (id={}) created successfully with owner: {}", group.getName(), group.getId(), username);

        return toResponseDTO(group, 1L, GroupMemberRole.OWNER);
    }

    @Override
    public GroupResponseDTO getGroupById(Long groupId, String username) {
        log.info("Fetching group by id: {} for user: {}", groupId, username);

        StudyGroup group = findGroupById(groupId);
        long memberCount = groupMemberRepository.countByGroup_Id(groupId);

        // Determine current user's role in this group
        GroupMemberRole currentUserRole = null;
        if (username != null) {
            User user = findUserByUsername(username);
            currentUserRole = groupMemberRepository.findByGroup_IdAndUser_Id(groupId, user.getId())
                    .map(GroupMember::getRole)
                    .orElse(null);
        }

        return toResponseDTO(group, memberCount, currentUserRole);
    }

    @Override
    public List<GroupResponseDTO> getAllGroups(String username) {
        log.info("Fetching all groups for user: {}", username);

        User user = findUserByUsername(username);
        List<StudyGroup> groups = studyGroupRepository.findAll();

        return groups.stream()
                .map(group -> {
                    long memberCount = groupMemberRepository.countByGroup_Id(group.getId());
                    GroupMemberRole role = groupMemberRepository.findByGroup_IdAndUser_Id(group.getId(), user.getId())
                            .map(GroupMember::getRole)
                            .orElse(null);
                    return toResponseDTO(group, memberCount, role);
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<GroupResponseDTO> getMyGroups(String username) {
        log.info("Fetching groups for user: {}", username);

        User user = findUserByUsername(username);
        List<GroupMember> memberships = groupMemberRepository.findByUser_Id(user.getId());

        return memberships.stream()
                .map(membership -> {
                    StudyGroup group = membership.getGroup();
                    long memberCount = groupMemberRepository.countByGroup_Id(group.getId());
                    return toResponseDTO(group, memberCount, membership.getRole());
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void joinGroup(Long groupId, String username) {
        log.info("User '{}' attempting to join group id: {}", username, groupId);

        StudyGroup group = findGroupById(groupId);
        User user = findUserByUsername(username);

        // Prevent duplicate membership
        if (groupMemberRepository.existsByGroup_IdAndUser_Id(groupId, user.getId())) {
            throw new IllegalStateException("You are already a member of this group");
        }

        GroupMember member = GroupMember.builder()
                .group(group)
                .user(user)
                .role(GroupMemberRole.MEMBER)
                .build();

        groupMemberRepository.save(member);

        log.info("User '{}' joined group '{}' (id={})", username, group.getName(), groupId);
    }

    @Override
    @Transactional
    public void leaveGroup(Long groupId, String username) {
        log.info("User '{}' attempting to leave group id: {}", username, groupId);

        findGroupById(groupId);
        User user = findUserByUsername(username);

        GroupMember membership = groupMemberRepository.findByGroup_IdAndUser_Id(groupId, user.getId())
                .orElseThrow(() -> new IllegalStateException("You are not a member of this group"));

        // Prevent OWNER from leaving
        if (membership.getRole() == GroupMemberRole.OWNER) {
            throw new IllegalStateException("Group owner cannot leave the group. Transfer ownership first or delete the group.");
        }

        groupMemberRepository.deleteByGroup_IdAndUser_Id(groupId, user.getId());

        log.info("User '{}' left group id: {}", username, groupId);
    }

    @Override
    public List<GroupMemberDTO> getGroupMembers(Long groupId) {
        log.info("Fetching members for group id: {}", groupId);

        findGroupById(groupId);

        List<GroupMember> members = groupMemberRepository.findByGroup_Id(groupId);

        return members.stream()
                .map(this::toMemberDTO)
                .collect(Collectors.toList());
    }

    // ===== Helper Methods =====

    private User findUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
    }

    private StudyGroup findGroupById(Long groupId) {
        return studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group", "id", groupId));
    }

    private GroupResponseDTO toResponseDTO(StudyGroup group, long memberCount, GroupMemberRole currentUserRole) {
        return GroupResponseDTO.builder()
                .id(group.getId())
                .name(group.getName())
                .description(group.getDescription())
                .groupType(group.getGroupType())
                .subject(group.getSubject())
                .academicLevel(group.getAcademicLevel())
                .imageUrl(group.getImageUrl())
                .visibility(group.getVisibility())
                .creatorId(group.getCreatedBy().getId())
                .creatorUsername(group.getCreatedBy().getUsername())
                .creatorProfileImageUrl(group.getCreatedBy().getProfileImageUrl())
                .memberCount(memberCount)
                .createdAt(group.getCreatedAt())
                .updatedAt(group.getUpdatedAt())
                .currentUserRole(currentUserRole)
                .build();
    }

    private GroupMemberDTO toMemberDTO(GroupMember member) {
        return GroupMemberDTO.builder()
                .userId(member.getUser().getId())
                .username(member.getUser().getUsername())
                .profileImageUrl(member.getUser().getProfileImageUrl())
                .role(member.getRole())
                .joinedAt(member.getJoinedAt())
                .build();
    }
}

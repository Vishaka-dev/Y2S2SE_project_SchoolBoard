package com.my_app.schoolboard.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.my_app.schoolboard.dto.CreateGroupRequestDTO;
import com.my_app.schoolboard.dto.GroupMemberDTO;
import com.my_app.schoolboard.dto.GroupResponseDTO;
import com.my_app.schoolboard.exception.ResourceNotFoundException;
import com.my_app.schoolboard.model.Group;
import com.my_app.schoolboard.model.GroupMember;
import com.my_app.schoolboard.model.GroupMemberRole;
import com.my_app.schoolboard.model.GroupVisibility;
import com.my_app.schoolboard.model.Role;
import com.my_app.schoolboard.model.User;
import com.my_app.schoolboard.repository.GroupMemberRepository;
import com.my_app.schoolboard.repository.GroupRepository;
import com.my_app.schoolboard.repository.InstituteProfileRepository;
import com.my_app.schoolboard.repository.StudentProfileRepository;
import com.my_app.schoolboard.repository.TeacherProfileRepository;
import com.my_app.schoolboard.repository.UserRepository;
import com.my_app.schoolboard.service.GroupService;
import com.my_app.schoolboard.service.group.GroupTypeBehaviorFactory;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GroupServiceImpl implements GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final TeacherProfileRepository teacherProfileRepository;
    private final InstituteProfileRepository instituteProfileRepository;
    private final GroupTypeBehaviorFactory groupTypeBehaviorFactory;

    @Override
    @Transactional
    public GroupResponseDTO createGroup(CreateGroupRequestDTO request, String username) {
        User creator = getUserByUsername(username);
        groupTypeBehaviorFactory.getBehavior(request.getGroupType()).validateCreateRequest(request);

        Group group = Group.builder()
                .name(request.getName().trim())
                .description(trimToNull(request.getDescription()))
                .groupType(request.getGroupType())
                .subject(request.getSubject().trim())
                .academicLevel(request.getAcademicLevel().trim())
                .imageUrl(trimToNull(request.getImageUrl()))
                .visibility(request.getVisibility() != null ? request.getVisibility() : GroupVisibility.PUBLIC)
                .createdBy(creator)
                .build();

        Group savedGroup = groupRepository.save(group);

        groupMemberRepository.save(GroupMember.builder()
                .group(savedGroup)
                .user(creator)
                .role(GroupMemberRole.OWNER)
                .build());

        return mapToGroupResponse(savedGroup, creator.getId(), GroupMemberRole.OWNER, true);
    }

    @Override
    public GroupResponseDTO getGroupById(Long groupId, String username) {
        User currentUser = getUserByUsername(username);
        Group group = getGroupOrThrow(groupId);
        GroupMember membership = getMembership(groupId, currentUser.getId()).orElse(null);

        validateCanAccessGroup(group, membership);

        return mapToGroupResponse(group, currentUser.getId(), membership != null ? membership.getRole() : null,
                membership != null);
    }

    @Override
    public List<GroupResponseDTO> getGroups(String username) {
        User currentUser = getUserByUsername(username);
        return groupRepository.findAccessibleGroups(currentUser.getId()).stream()
                .map(group -> {
                    GroupMember membership = getMembership(group.getId(), currentUser.getId()).orElse(null);
                    return mapToGroupResponse(group, currentUser.getId(),
                            membership != null ? membership.getRole() : null,
                            membership != null);
                })
                .toList();
    }

    @Override
    public List<GroupResponseDTO> getMyGroups(String username) {
        User currentUser = getUserByUsername(username);
        return groupMemberRepository.findAllByUserIdOrderByJoinedAtDesc(currentUser.getId()).stream()
                .map(GroupMember::getGroup)
                .map(group -> {
                    GroupMember membership = getMembership(group.getId(), currentUser.getId()).orElse(null);
                    return mapToGroupResponse(group, currentUser.getId(),
                            membership != null ? membership.getRole() : null,
                            membership != null);
                })
                .toList();
    }

    @Override
    @Transactional
    public void joinGroup(Long groupId, String username) {
        User currentUser = getUserByUsername(username);
        Group group = getGroupOrThrow(groupId);

        if (groupMemberRepository.existsByGroupIdAndUserId(groupId, currentUser.getId())) {
            throw new IllegalStateException("You are already a member of this group");
        }

        groupMemberRepository.save(GroupMember.builder()
                .group(group)
                .user(currentUser)
                .role(GroupMemberRole.MEMBER)
                .build());
    }

    @Override
    @Transactional
    public void leaveGroup(Long groupId, String username) {
        User currentUser = getUserByUsername(username);
        GroupMember membership = groupMemberRepository.findByGroupIdAndUserId(groupId, currentUser.getId())
                .orElseThrow(() -> new IllegalStateException("You are not a member of this group"));

        if (membership.getRole() == GroupMemberRole.OWNER) {
            throw new IllegalStateException("Group owners cannot leave their own group");
        }

        groupMemberRepository.delete(membership);
    }

    @Override
    public List<GroupMemberDTO> getGroupMembers(Long groupId, String username) {
        User currentUser = getUserByUsername(username);
        Group group = getGroupOrThrow(groupId);
        GroupMember membership = getMembership(groupId, currentUser.getId()).orElse(null);

        validateCanAccessGroup(group, membership);

        return groupMemberRepository.findAllByGroupIdOrderByJoinedAtAsc(groupId).stream()
                .map(this::mapToMemberResponse)
                .toList();
    }

    private Group getGroupOrThrow(Long groupId) {
        return groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group", "id", groupId));
    }

    private User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
    }

    private java.util.Optional<GroupMember> getMembership(Long groupId, Long userId) {
        return groupMemberRepository.findByGroupIdAndUserId(groupId, userId);
    }

    private void validateCanAccessGroup(Group group, GroupMember membership) {
        if (group.getVisibility() == GroupVisibility.PRIVATE && membership == null) {
            throw new IllegalStateException("This private group is only visible to members");
        }
    }

    private GroupResponseDTO mapToGroupResponse(Group group, Long currentUserId, GroupMemberRole currentUserRole,
            boolean joined) {
        User creator = group.getCreatedBy();
        return GroupResponseDTO.builder()
                .id(group.getId())
                .name(group.getName())
                .description(group.getDescription())
                .groupType(group.getGroupType())
                .subject(group.getSubject())
                .academicLevel(group.getAcademicLevel())
                .imageUrl(group.getImageUrl())
                .visibility(group.getVisibility())
                .creator(GroupResponseDTO.CreatorDTO.builder()
                        .id(creator.getId())
                        .username(creator.getUsername())
                        .displayName(getDisplayName(creator))
                        .profileImageUrl(getProfileImage(creator))
                        .build())
                .memberCount(groupMemberRepository.countByGroupId(group.getId()))
                .joined(joined)
                .currentUserRole(currentUserRole)
                .createdAt(group.getCreatedAt())
                .updatedAt(group.getUpdatedAt())
                .build();
    }

    private GroupMemberDTO mapToMemberResponse(GroupMember groupMember) {
        User user = groupMember.getUser();
        return GroupMemberDTO.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .displayName(getDisplayName(user))
                .profileImageUrl(getProfileImage(user))
                .role(groupMember.getRole())
                .joinedAt(groupMember.getJoinedAt())
                .build();
    }

    private String getDisplayName(User user) {
        Role role = user.getRole();
        return switch (role) {
            case SCHOOL_STUDENT, UNIVERSITY_STUDENT, STUDENT ->
                studentProfileRepository.findByUser(user).map(profile -> profile.getFullName()).orElse(user.getUsername());
            case TEACHER ->
                teacherProfileRepository.findByUser(user).map(profile -> profile.getFullName()).orElse(user.getUsername());
            case INSTITUTE ->
                instituteProfileRepository.findByUser(user).map(profile -> profile.getInstitutionName())
                        .orElse(user.getUsername());
            default -> user.getUsername();
        };
    }

    private String getProfileImage(User user) {
        return user.getProfileImageUrl() != null ? user.getProfileImageUrl() : user.getImageUrl();
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}

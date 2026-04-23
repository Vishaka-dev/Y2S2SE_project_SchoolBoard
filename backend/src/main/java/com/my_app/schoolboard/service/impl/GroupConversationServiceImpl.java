package com.my_app.schoolboard.service.impl;

import com.my_app.schoolboard.dto.GroupConversationResponseDTO;
import com.my_app.schoolboard.exception.ResourceNotFoundException;
import com.my_app.schoolboard.exception.UnauthorizedOperationException;
import com.my_app.schoolboard.model.GroupConversation;
import com.my_app.schoolboard.model.StudyGroup;
import com.my_app.schoolboard.model.User;
import com.my_app.schoolboard.repository.*;
import com.my_app.schoolboard.service.GroupConversationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class GroupConversationServiceImpl implements GroupConversationService {

    private final GroupConversationRepository groupConversationRepository;
    private final StudyGroupRepository studyGroupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public GroupConversationResponseDTO getOrCreateGroupConversation(Long groupId, String username) {
        log.info("Getting or creating group conversation for group {} by user {}", groupId, username);

        // Get group
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));

        // Verify user is member
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!groupMemberRepository.existsByGroup_IdAndUser_Id(groupId, user.getId())) {
            throw new UnauthorizedOperationException("You are not a member of this group");
        }

        // Get or create conversation
        GroupConversation conversation = groupConversationRepository.findByGroup_Id(groupId)
                .orElseGet(() -> {
                    log.info("Creating new group conversation for group {}", groupId);
                    GroupConversation newConversation = GroupConversation.builder()
                            .group(group)
                            .build();
                    return groupConversationRepository.save(newConversation);
                });

        long memberCount = groupMemberRepository.countByGroup_Id(groupId);
        return GroupConversationResponseDTO.fromGroupConversation(conversation, memberCount);
    }

    @Override
    public GroupConversationResponseDTO getGroupConversation(Long conversationId) {
        log.info("Fetching group conversation {}", conversationId);

        GroupConversation conversation = groupConversationRepository.findByIdWithLastMessage(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Group conversation not found"));

        long memberCount = groupMemberRepository.countByGroup_Id(conversation.getGroup().getId());
        return GroupConversationResponseDTO.fromGroupConversation(conversation, memberCount);
    }

    @Override
    public Page<GroupConversationResponseDTO> getUserGroupConversations(String username, Pageable pageable) {
        log.info("Fetching group conversations for user {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return groupConversationRepository.findGroupConversationsForUser(user.getId(), pageable)
                .map(conversation -> {
                    long memberCount = groupMemberRepository.countByGroup_Id(conversation.getGroup().getId());
                    return GroupConversationResponseDTO.fromGroupConversation(conversation, memberCount);
                });
    }

    @Override
    public GroupConversationResponseDTO getGroupConversationDetail(Long groupId) {
        log.info("Fetching group conversation detail for group {}", groupId);

        GroupConversation conversation = groupConversationRepository.findByGroup_Id(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group conversation not found"));

        long memberCount = groupMemberRepository.countByGroup_Id(groupId);
        return GroupConversationResponseDTO.fromGroupConversation(conversation, memberCount);
    }
}

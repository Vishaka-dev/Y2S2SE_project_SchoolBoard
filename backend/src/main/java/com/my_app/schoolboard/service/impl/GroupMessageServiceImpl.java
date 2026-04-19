package com.my_app.schoolboard.service.impl;

import com.my_app.schoolboard.dto.GroupMessageResponseDTO;
import com.my_app.schoolboard.exception.ResourceNotFoundException;
import com.my_app.schoolboard.exception.UnauthorizedOperationException;
import com.my_app.schoolboard.model.*;
import com.my_app.schoolboard.repository.*;
import com.my_app.schoolboard.service.GroupMessageService;
import com.my_app.schoolboard.service.FileUploadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class GroupMessageServiceImpl implements GroupMessageService {

    private final GroupMessageRepository groupMessageRepository;
    private final GroupConversationRepository groupConversationRepository;
    private final GroupAttachmentRepository groupAttachmentRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;
    private final FileUploadService fileUploadService;

    @Override
    @Transactional
    public GroupMessageResponseDTO sendMessage(Long groupConversationId, Long senderId, String content) {
        log.info("Sending message in group conversation {} from user {}", groupConversationId, senderId);

        // Validate content
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("Message content cannot be empty");
        }
        if (content.length() > 5000) {
            throw new IllegalArgumentException("Message content exceeds 5000 characters");
        }

        // Get conversation
        GroupConversation conversation = groupConversationRepository.findById(groupConversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Group conversation not found"));

        // Verify sender is group member
        if (!groupMemberRepository.existsByGroup_IdAndUser_Id(conversation.getGroup().getId(), senderId)) {
            throw new UnauthorizedOperationException("Not a member of this group");
        }

        // Get sender
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Create message
        GroupMessage message = GroupMessage.builder()
                .groupConversation(conversation)
                .sender(sender)
                .content(content.trim())
                .isRead(false)
                .build();

        message = groupMessageRepository.save(message);

        // Update last message in conversation
        conversation.setLastMessage(message);
        conversation.setUpdatedAt(LocalDateTime.now());
        groupConversationRepository.save(conversation);

        log.info("Message sent successfully: id={}, groupId={}", message.getId(), conversation.getGroup().getId());

        return GroupMessageResponseDTO.fromGroupMessage(message);
    }

    @Override
    public Page<GroupMessageResponseDTO> fetchMessages(Long groupConversationId, Pageable pageable) {
        log.info("Fetching messages for group conversation {}", groupConversationId);

        // Verify conversation exists
        if (!groupConversationRepository.existsById(groupConversationId)) {
            throw new ResourceNotFoundException("Group conversation not found");
        }

        return groupMessageRepository.findByGroupConversation_Id(groupConversationId, pageable)
                .map(GroupMessageResponseDTO::fromGroupMessage);
    }

    @Override
    public GroupMessageResponseDTO getMessageById(Long messageId) {
        log.info("Fetching group message {}", messageId);

        GroupMessage message = groupMessageRepository.findByIdWithDetails(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));

        return GroupMessageResponseDTO.fromGroupMessage(message);
    }

    @Override
    @Transactional
    public void deleteMessage(Long messageId, Long userId) {
        log.info("Deleting group message {} by user {}", messageId, userId);

        GroupMessage message = groupMessageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));

        // Only allow sender to delete own message (or admin/owner in future)
        if (!message.getSender().getId().equals(userId)) {
            throw new UnauthorizedOperationException("You can only delete your own messages");
        }

        groupMessageRepository.deleteById(messageId);
        log.info("Message deleted: id={}", messageId);
    }

    @Override
    @Transactional
    public GroupMessageResponseDTO uploadAttachment(Long messageId, MultipartFile file) {
        log.info("Uploading attachment to message {}", messageId);

        GroupMessage message = groupMessageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));

        // Validate file
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("File size exceeds 5MB limit");
        }

        try {
            // Upload file
            String fileUrl = fileUploadService.uploadFile(file, "group-messages");

            // Create attachment
            GroupAttachment attachment = GroupAttachment.builder()
                    .groupMessage(message)
                    .fileName(file.getOriginalFilename())
                    .fileUrl(fileUrl)
                    .fileSize(file.getSize())
                    .fileType(file.getContentType())
                    .build();

            groupAttachmentRepository.save(attachment);
            log.info("Attachment uploaded: id={}, fileName={}", attachment.getId(), attachment.getFileName());

            return GroupMessageResponseDTO.fromGroupMessage(message);
        } catch (Exception e) {
            log.error("Failed to upload attachment: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to upload file: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void markAsRead(Long messageId) {
        log.info("Marking message {} as read", messageId);

        GroupMessage message = groupMessageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));

        message.setIsRead(true);
        message.setReadAt(LocalDateTime.now());
        groupMessageRepository.save(message);
    }

    @Override
    public long countUnreadMessages(Long groupConversationId, Long userId) {
        return groupMessageRepository.countUnreadMessages(groupConversationId, userId);
    }
}

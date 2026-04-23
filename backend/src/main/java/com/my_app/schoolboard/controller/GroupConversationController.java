package com.my_app.schoolboard.controller;

import com.my_app.schoolboard.dto.GroupConversationResponseDTO;
import com.my_app.schoolboard.dto.GroupMessageResponseDTO;
import com.my_app.schoolboard.service.GroupConversationService;
import com.my_app.schoolboard.service.GroupMessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/group-conversations")
@CrossOrigin(origins = "${app.frontend-url}", allowCredentials = "true")
@RequiredArgsConstructor
@Slf4j
public class GroupConversationController {

    private final GroupConversationService groupConversationService;
    private final GroupMessageService groupMessageService;

    /**
     * Get or create group conversation
     * GET /api/group-conversations/{groupId}
     */
    @GetMapping("/{groupId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<GroupConversationResponseDTO> getOrCreateGroupConversation(
            @PathVariable Long groupId,
            Authentication authentication) {

        log.info("Getting or creating group conversation for group {} by user {}", groupId, authentication.getName());

        GroupConversationResponseDTO response = groupConversationService.getOrCreateGroupConversation(
                groupId, authentication.getName());

        return ResponseEntity.ok(response);
    }

    /**
     * Get all group conversations for current user
     * GET /api/group-conversations?page=0&size=10
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<GroupConversationResponseDTO>> getUserGroupConversations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {

        log.info("Fetching group conversations for user {}", authentication.getName());

        Pageable pageable = PageRequest.of(page, size);
        Page<GroupConversationResponseDTO> response = groupConversationService
                .getUserGroupConversations(authentication.getName(), pageable);

        return ResponseEntity.ok(response);
    }

    /**
     * Get messages for a group conversation
     * GET /api/group-conversations/{conversationId}/messages?page=0&size=20
     */
    @GetMapping("/{conversationId}/messages")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<GroupMessageResponseDTO>> getGroupMessages(
            @PathVariable Long conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        log.info("Fetching messages for group conversation {}", conversationId);

        Pageable pageable = PageRequest.of(page, size);
        Page<GroupMessageResponseDTO> response = groupMessageService.fetchMessages(conversationId, pageable);

        return ResponseEntity.ok(response);
    }
}

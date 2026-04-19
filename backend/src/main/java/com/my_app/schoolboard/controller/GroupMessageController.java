package com.my_app.schoolboard.controller;

import com.my_app.schoolboard.dto.GroupMessageResponseDTO;
import com.my_app.schoolboard.exception.ResourceNotFoundException;
import com.my_app.schoolboard.model.User;
import com.my_app.schoolboard.repository.UserRepository;
import com.my_app.schoolboard.service.GroupMessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/group-messages")
@CrossOrigin(origins = "${app.frontend-url}", allowCredentials = "true")
@RequiredArgsConstructor
@Slf4j
public class GroupMessageController {

    private final GroupMessageService groupMessageService;
    private final UserRepository userRepository;

    /**
     * Send a message in a group conversation
     * POST /api/group-messages
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<GroupMessageResponseDTO> sendMessage(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {

        log.info("Sending group message from user {}", authentication.getName());

        Long groupConversationId = ((Number) request.get("groupConversationId")).longValue();
        String content = (String) request.get("content");

        // Get user ID from authentication
        Long userId = getCurrentAuthenticatedUserId(authentication);

        GroupMessageResponseDTO response = groupMessageService.sendMessage(
                groupConversationId, userId, content);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Delete a group message
     * DELETE /api/group-messages/{messageId}
     */
    @DeleteMapping("/{messageId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> deleteMessage(
            @PathVariable Long messageId,
            Authentication authentication) {

        log.info("Deleting group message {} by user {}", messageId, authentication.getName());

        Long userId = getCurrentAuthenticatedUserId(authentication);
        groupMessageService.deleteMessage(messageId, userId);

        return ResponseEntity.ok(Map.of("message", "Message deleted successfully"));
    }

    /**
     * Upload attachment to a group message
     * POST /api/group-messages/{messageId}/attachments
     */
    @PostMapping("/{messageId}/attachments")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<GroupMessageResponseDTO> uploadAttachment(
            @PathVariable Long messageId,
            @RequestParam("file") MultipartFile file) {

        log.info("Uploading attachment to group message {}", messageId);

        GroupMessageResponseDTO response = groupMessageService.uploadAttachment(messageId, file);

        return ResponseEntity.ok(response);
    }

    /**
     * Mark message as read
     * PUT /api/group-messages/{messageId}/read
     */
    @PutMapping("/{messageId}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> markAsRead(@PathVariable Long messageId) {

        log.info("Marking group message {} as read", messageId);

        groupMessageService.markAsRead(messageId);

        return ResponseEntity.ok(Map.of("message", "Message marked as read"));
    }

    /**
     * Helper method to extract user ID from authentication
     */
    private Long getCurrentAuthenticatedUserId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() 
                || "anonymousUser".equals(authentication.getName())) {
            throw new IllegalArgumentException("User is not authenticated");
        }

        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        return user.getId();
    }
}

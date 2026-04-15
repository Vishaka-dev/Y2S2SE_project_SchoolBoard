package com.my_app.schoolboard.controller;

import com.my_app.schoolboard.dto.MessageRequestDTO;
import com.my_app.schoolboard.dto.MessageResponseDTO;
import com.my_app.schoolboard.dto.UpdateMessageRequestDTO;
import com.my_app.schoolboard.dto.AttachmentDTO;
import com.my_app.schoolboard.model.User;
import com.my_app.schoolboard.repository.UserRepository;
import com.my_app.schoolboard.exception.ResourceNotFoundException;
import com.my_app.schoolboard.service.MessageService;
import com.my_app.schoolboard.service.AttachmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "${app.frontend-url}", allowCredentials = "true")
@RequiredArgsConstructor
@Slf4j
public class MessageController {

    private final MessageService messageService;
    private final AttachmentService attachmentService;
    private final UserRepository userRepository;

    /**
     * Send a message
     * POST /api/messages
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MessageResponseDTO> sendMessage(
            @Valid @RequestBody MessageRequestDTO request,
            Authentication authentication) {
        
        Long userId = getCurrentAuthenticatedUserId(authentication);
        log.info("User: {} sending message in conversation: {}", userId, request.getConversationId());

        MessageResponseDTO message = messageService.sendMessage(
            request.getConversationId(),
            userId,
            request.getContent()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(message);
    }

    /**
     * Get messages from a conversation (paginated, newest first)
     * GET /api/messages/conversation/{conversationId}
     */
    @GetMapping("/conversation/{conversationId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<MessageResponseDTO>> getMessages(
            @PathVariable Long conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            Authentication authentication) {
        
        Long userId = getCurrentAuthenticatedUserId(authentication);
        log.info("User: {} fetching messages from conversation: {}, page: {}, size: {}", 
            userId, conversationId, page, size);

        Page<MessageResponseDTO> messages = messageService.getMessages(
            conversationId,
            userId,
            PageRequest.of(page, size)
        );

        return ResponseEntity.ok(messages);
    }

    /**
     * Get a single message by ID
     * GET /api/messages/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MessageResponseDTO> getMessage(
            @PathVariable Long id,
            Authentication authentication) {
        
        Long userId = getCurrentAuthenticatedUserId(authentication);
        log.info("User: {} fetching message: {}", userId, id);

        MessageResponseDTO message = messageService.getMessageById(id);

        return ResponseEntity.ok(message);
    }

    /**
     * Edit/update a message
     * PUT /api/messages/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MessageResponseDTO> editMessage(
            @PathVariable Long id,
            @Valid @RequestBody UpdateMessageRequestDTO request,
            Authentication authentication) {
        
        Long userId = getCurrentAuthenticatedUserId(authentication);
        log.info("User: {} editing message: {}", userId, id);

        MessageResponseDTO message = messageService.editMessage(
            id,
            userId,
            request.getContent()
        );

        return ResponseEntity.ok(message);
    }

    /**
     * Delete a message
     * DELETE /api/messages/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> deleteMessage(
            @PathVariable Long id,
            Authentication authentication) {
        
        Long userId = getCurrentAuthenticatedUserId(authentication);
        log.info("User: {} deleting message: {}", userId, id);

        messageService.deleteMessage(id, userId);

        return ResponseEntity.ok(Map.of("message", "Message deleted successfully"));
    }

    /**
     * Mark a message as read
     * PUT /api/messages/{id}/read
     */
    @PutMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> markMessageAsRead(
            @PathVariable Long id,
            Authentication authentication) {
        
        Long userId = getCurrentAuthenticatedUserId(authentication);
        log.info("User: {} marking message: {} as read", userId, id);

        messageService.markAsRead(id, userId);

        return ResponseEntity.ok(Map.of("message", "Message marked as read"));
    }

    /**
     * Mark all messages in a conversation as read
     * PUT /api/messages/conversation/{conversationId}/read
     */
    @PutMapping("/conversation/{conversationId}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> markConversationMessagesAsRead(
            @PathVariable Long conversationId,
            Authentication authentication) {
        
        Long userId = getCurrentAuthenticatedUserId(authentication);
        log.info("User: {} marking all messages in conversation: {} as read", userId, conversationId);

        messageService.markConversationMessagesAsRead(conversationId, userId);

        return ResponseEntity.ok(Map.of("message", "All messages marked as read"));
    }

    /**
     * Search messages in a conversation by keyword
     * GET /api/messages/conversation/{conversationId}/search
     */
    @GetMapping("/conversation/{conversationId}/search")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<MessageResponseDTO>> searchMessages(
            @PathVariable Long conversationId,
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            Authentication authentication) {
        
        Long userId = getCurrentAuthenticatedUserId(authentication);
        log.info("User: {} searching messages in conversation: {} with keyword: {}", 
            userId, conversationId, keyword);

        Page<MessageResponseDTO> results = messageService.searchMessages(
            conversationId,
            userId,
            keyword,
            PageRequest.of(page, size)
        );

        return ResponseEntity.ok(results);
    }

    /**
     * Upload attachments to a message
     * POST /api/messages/{messageId}/attachments
     */
    @PostMapping("/{messageId}/attachments")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<AttachmentDTO>> uploadAttachments(
            @PathVariable Long messageId,
            @RequestParam("files") List<MultipartFile> files,
            Authentication authentication) {
        
        Long userId = getCurrentAuthenticatedUserId(authentication);
        log.info("User: {} uploading {} attachments to message: {}", userId, files.size(), messageId);
        
        try {
            List<AttachmentDTO> attachments = attachmentService.uploadAttachments(messageId, files, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(attachments);
        } catch (IOException e) {
            log.error("Failed to upload attachments", e);
            throw new RuntimeException("Failed to upload attachments", e);
        }
    }

    /**
     * Get attachments for a message
     * GET /api/messages/{messageId}/attachments
     */
    @GetMapping("/{messageId}/attachments")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<AttachmentDTO>> getMessageAttachments(
            @PathVariable Long messageId,
            Authentication authentication) {
        
        Long userId = getCurrentAuthenticatedUserId(authentication);
        log.info("User: {} fetching attachments for message: {}", userId, messageId);
        
        List<AttachmentDTO> attachments = attachmentService.getAttachmentsByMessage(messageId);
        return ResponseEntity.ok(attachments);
    }

    /**
     * Download an attachment by ID
     * GET /api/messages/attachments/download/{id}
     */
    @GetMapping("/attachments/download/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> downloadAttachment(
            @PathVariable Long id,
            Authentication authentication) {
        
        Long userId = getCurrentAuthenticatedUserId(authentication);
        log.info("User: {} downloading attachment: {}", userId, id);
        
        try {
            AttachmentDTO attachment = attachmentService.getAttachment(id);
            byte[] fileContent = attachmentService.downloadAttachment(id);
            
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + attachment.getFileName() + "\"")
                .header(HttpHeaders.CONTENT_TYPE, attachment.getFileType())
                .body(fileContent);
        } catch (IOException | ResourceNotFoundException e) {
            log.error("Failed to download attachment", e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Delete an attachment by ID
     * DELETE /api/messages/attachments/{id}
     */
    @DeleteMapping("/attachments/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> deleteAttachment(
            @PathVariable Long id,
            Authentication authentication) {
        
        Long userId = getCurrentAuthenticatedUserId(authentication);
        log.info("User: {} deleting attachment: {}", userId, id);
        
        try {
            attachmentService.deleteAttachment(id, userId);
            return ResponseEntity.ok(Map.of("message", "Attachment deleted successfully"));
        } catch (ResourceNotFoundException e) {
            log.error("Attachment not found", e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Attachment not found"));
        }
    }

    /**
     * Extract current authenticated user ID from Authentication object
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

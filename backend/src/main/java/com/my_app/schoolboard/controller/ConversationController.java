package com.my_app.schoolboard.controller;

import com.my_app.schoolboard.dto.ConversationDTO;
import com.my_app.schoolboard.dto.ConversationListItemDTO;
import com.my_app.schoolboard.dto.CreateConversationRequestDTO;
import com.my_app.schoolboard.model.User;
import com.my_app.schoolboard.repository.UserRepository;
import com.my_app.schoolboard.service.ConversationService;
import com.my_app.schoolboard.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/api/conversations")
@CrossOrigin(origins = "${app.frontend-url}", allowCredentials = "true")
@RequiredArgsConstructor
@Slf4j
public class ConversationController {

    private final ConversationService conversationService;
    private final UserRepository userRepository;

    /**
     * Get all conversations for the current user (paginated)
     * GET /api/conversations
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<ConversationListItemDTO>> getUserConversations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        
        Long userId = getCurrentAuthenticatedUserId(authentication);
        log.info("Fetching conversations for user: {}, page: {}, size: {}", userId, page, size);

        Page<ConversationListItemDTO> conversations = conversationService
            .getUserConversations(userId, PageRequest.of(page, size));

        return ResponseEntity.ok(conversations);
    }

    /**
     * Get a specific conversation with messages
     * GET /api/conversations/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ConversationDTO> getConversation(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            Authentication authentication) {
        
        Long userId = getCurrentAuthenticatedUserId(authentication);
        log.info("Fetching conversation: {} for user: {}, page: {}, size: {}", id, userId, page, size);

        ConversationDTO conversation = conversationService
            .getConversationWithMessages(id, userId, PageRequest.of(page, size));

        return ResponseEntity.ok(conversation);
    }

    /**
     * Create or get a conversation with a specific user
     * POST /api/conversations
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ConversationDTO> getOrCreateConversation(
            @Valid @RequestBody CreateConversationRequestDTO request,
            Authentication authentication) {
        
        Long userId = getCurrentAuthenticatedUserId(authentication);
        Long otherUserId = request.getOtherUserId();

        log.info("Getting or creating conversation between user: {} and user: {}", userId, otherUserId);

        // Get or create the conversation
        var conversation = conversationService.getOrCreateConversation(userId, otherUserId);

        // Return full conversation DTO
        ConversationDTO dto = ConversationDTO.builder()
            .id(conversation.getId())
            .user1(com.my_app.schoolboard.dto.UserBasicDTO.fromUser(conversation.getUser1()))
            .user2(com.my_app.schoolboard.dto.UserBasicDTO.fromUser(conversation.getUser2()))
            .lastMessage(null) // Will be updated when first message is sent
            .unreadCount(0)
            .createdAt(conversation.getCreatedAt())
            .updatedAt(conversation.getUpdatedAt())
            .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    /**
     * Delete a conversation
     * DELETE /api/conversations/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> deleteConversation(
            @PathVariable Long id,
            Authentication authentication) {
        
        Long userId = getCurrentAuthenticatedUserId(authentication);
        log.info("User: {} deleting conversation: {}", userId, id);

        conversationService.deleteConversation(id, userId);

        return ResponseEntity.ok(Map.of("message", "Conversation deleted successfully"));
    }

    /**
     * Mark a conversation as read
     * PUT /api/conversations/{id}/read
     */
    @PutMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> markConversationAsRead(
            @PathVariable Long id,
            Authentication authentication) {
        
        Long userId = getCurrentAuthenticatedUserId(authentication);
        log.info("User: {} marking conversation: {} as read", userId, id);

        conversationService.markConversationAsRead(id, userId);

        return ResponseEntity.ok(Map.of("message", "Conversation marked as read"));
    }

    /**
     * Search conversations by keyword (username or email of other user)
     * GET /api/conversations/search
     */
    @GetMapping("/search")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<ConversationListItemDTO>> searchConversations(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        
        Long userId = getCurrentAuthenticatedUserId(authentication);
        log.info("User: {} searching conversations with keyword: {}", userId, keyword);

        Page<ConversationListItemDTO> results = conversationService
            .searchConversations(userId, keyword, PageRequest.of(page, size));

        return ResponseEntity.ok(results);
    }

    /**
     * Get total unread message count for the current user
     * GET /api/conversations/unread-count
     */
    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Integer>> getTotalUnreadCount(Authentication authentication) {
        Long userId = getCurrentAuthenticatedUserId(authentication);
        log.info("Fetching total unread count for user: {}", userId);

        Integer unreadCount = conversationService.getTotalUnreadCount(userId);

        return ResponseEntity.ok(Map.of("unreadCount", unreadCount));
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

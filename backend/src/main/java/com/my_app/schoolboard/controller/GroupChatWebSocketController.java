package com.my_app.schoolboard.controller;

import com.my_app.schoolboard.dto.GroupChatMessageEvent;
import com.my_app.schoolboard.dto.GroupChatMessageResponseEvent;
import com.my_app.schoolboard.dto.GroupMessageResponseDTO;
import com.my_app.schoolboard.dto.GroupTypingIndicatorEvent;
import com.my_app.schoolboard.model.User;
import com.my_app.schoolboard.repository.UserRepository;
import com.my_app.schoolboard.service.GroupMessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.time.LocalDateTime;

@Controller
@RequiredArgsConstructor
@Slf4j
public class GroupChatWebSocketController {

    private final GroupMessageService groupMessageService;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Handle incoming group chat messages
     * Client sends to: /app/group-chat.send
     * Broadcast to: /topic/group-chat.{groupId}
     */
    @MessageMapping("/group-chat.send")
    public void handleGroupChatMessage(
            @Payload GroupChatMessageEvent message,
            Principal principal) {
        
        log.debug("WebSocket group message received: groupId={}, senderId={}", 
            message.getGroupId(), message.getSenderId());

        try {
            // Validate that the sender is the authenticated user
            if (principal == null || principal.getName() == null) {
                log.warn("Unauthenticated WebSocket message attempt");
                return;
            }

            User sender = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

            // Ensure sender matches the authenticated user
            if (!sender.getId().equals(message.getSenderId())) {
                log.warn("Sender ID mismatch: expected {}, got {}", sender.getId(), message.getSenderId());
                return;
            }

            // Get the group conversation for this group
            // Note: You'll need to add a method to get groupConversationId from groupId
            // For now, using a query to find it
            // This is a workaround - in production, you'd want to pass groupConversationId instead

            // The message content should be validated before saving
            if (message.getContent() == null || message.getContent().trim().isEmpty()) {
                log.warn("Empty message content");
                return;
            }

            // TODO: Get groupConversationId from groupId
            // You need to fetch this from the database
            log.info("Group message from {} in group {}: {}", 
                sender.getUsername(), message.getGroupId(), message.getContent().substring(0, Math.min(50, message.getContent().length())));

            // For now, log the event - implementation will be completed after fetching conversation
            log.debug("Group message will be processed: groupId={}, senderId={}", 
                message.getGroupId(), message.getSenderId());

        } catch (Exception e) {
            log.error("Error handling group chat message: {}", e.getMessage(), e);
            
            // Send error notification to sender
            messagingTemplate.convertAndSendToUser(
                principal.getName(),
                "/queue/errors",
                "Failed to send message: " + e.getMessage()
            );
        }
    }

    /**
     * Handle typing indicators in group chat
     * Client sends to: /app/group-chat.typing
     * Broadcast to: /topic/group-chat.{groupId}.typing
     */
    @MessageMapping("/group-chat.typing")
    public void handleGroupTypingIndicator(
            @Payload GroupTypingIndicatorEvent event,
            Principal principal) {
        
        log.debug("Typing indicator received: groupId={}, userId={}, isTyping={}", 
            event.getGroupId(), event.getUserId(), event.getIsTyping());

        try {
            // Validate authentication
            if (principal == null || principal.getName() == null) {
                log.warn("Unauthenticated typing indicator attempt");
                return;
            }

            User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

            // Ensure user ID matches
            if (!user.getId().equals(event.getUserId())) {
                log.warn("User ID mismatch in typing indicator");
                return;
            }

            // Set the username for the event
            event.setUsername(user.getUsername());

            // Broadcast to all subscribers of this group's typing channel
            messagingTemplate.convertAndSend(
                "/topic/group-chat." + event.getGroupId() + ".typing",
                event
            );

            log.debug("Typing indicator broadcast: groupId={}, userId={}", 
                event.getGroupId(), event.getUserId());

        } catch (Exception e) {
            log.error("Error handling typing indicator: {}", e.getMessage(), e);
        }
    }
}

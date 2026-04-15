package com.my_app.schoolboard.controller;

import com.my_app.schoolboard.dto.ChatMessageEvent;
import com.my_app.schoolboard.dto.ChatMessageResponseEvent;
import com.my_app.schoolboard.dto.MessageResponseDTO;
import com.my_app.schoolboard.dto.TypingIndicatorEvent;
import com.my_app.schoolboard.model.User;
import com.my_app.schoolboard.repository.UserRepository;
import com.my_app.schoolboard.service.MessageService;
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
public class ChatWebSocketController {

    private final MessageService messageService;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Handle incoming chat messages
     * Client sends to: /app/chat.send
     * Broadcast to: /topic/chat.{conversationId}
     */
    @MessageMapping("/chat.send")
    public void handleChatMessage(
            @Payload ChatMessageEvent message,
            Principal principal) {
        
        log.debug("WebSocket message received: conversationId={}, senderId={}", 
            message.getConversationId(), message.getSenderId());

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

            // Save the message to database via the service
            MessageResponseDTO savedMessage = messageService.sendMessage(
                message.getConversationId(),
                sender.getId(),
                message.getContent()
            );

            // Convert to WebSocket response event
            ChatMessageResponseEvent responseEvent = ChatMessageResponseEvent.fromMessageDTO(savedMessage);

            // Broadcast to all subscribers of this conversation
            messagingTemplate.convertAndSend(
                "/topic/chat." + message.getConversationId(),
                responseEvent
            );

            log.info("Message sent and broadcasted: messageId={}, conversationId={}", 
                responseEvent.getId(), message.getConversationId());

        } catch (Exception e) {
            log.error("Error handling chat message: {}", e.getMessage(), e);
            
            // Send error notification to sender
            messagingTemplate.convertAndSendToUser(
                principal.getName(),
                "/queue/errors",
                "Failed to send message: " + e.getMessage()
            );
        }
    }

    /**
     * Handle typing indicators
     * Client sends to: /app/chat.typing
     * Broadcast to: /topic/chat.{conversationId}.typing
     */
    @MessageMapping("/chat.typing")
    public void handleTypingIndicator(
            @Payload TypingIndicatorEvent event,
            Principal principal) {
        
        log.debug("Typing indicator received: conversationId={}, userId={}, isTyping={}", 
            event.getConversationId(), event.getUserId(), event.getIsTyping());

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

            // Broadcast typing indicator to all subscribers of this conversation
            messagingTemplate.convertAndSend(
                "/topic/chat." + event.getConversationId() + ".typing",
                event
            );

            log.debug("Typing indicator broadcasted: conversationId={}, userId={}", 
                event.getConversationId(), event.getUserId());

        } catch (Exception e) {
            log.error("Error handling typing indicator: {}", e.getMessage(), e);
        }
    }
}

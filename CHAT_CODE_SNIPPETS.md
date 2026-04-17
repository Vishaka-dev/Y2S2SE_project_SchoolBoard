# Chat Feature - Code Snippets & Reference

Quick copy-paste code snippets for the implementation.

---

## Backend Entity Code Snippets

### Conversation Entity
```java
package com.my_app.schoolboard.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "conversations", indexes = {
    @Index(name = "idx_user1", columnList = "user1_id"),
    @Index(name = "idx_user2", columnList = "user2_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user1_id", nullable = false)
    private User user1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user2_id", nullable = false)
    private User user2;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "last_message_id")
    private Message lastMessage;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void ensureUserOrder() {
        // Ensure user1 ID is always less than user2 ID
        if (user1.getId() > user2.getId()) {
            User temp = user1;
            user1 = user2;
            user2 = temp;
        }
    }

    public User getOtherUser(Long currentUserId) {
        return user1.getId().equals(currentUserId) ? user2 : user1;
    }

    public boolean containsUser(Long userId) {
        return user1.getId().equals(userId) || user2.getId().equals(userId);
    }
}
```

### Message Entity
```java
package com.my_app.schoolboard.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages", indexes = {
    @Index(name = "idx_conversation", columnList = "conversation_id"),
    @Index(name = "idx_sender", columnList = "sender_id"),
    @Index(name = "idx_created_at", columnList = "created_at DESC")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private Boolean isRead = false;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    public void markAsRead() {
        this.isRead = true;
        this.readAt = LocalDateTime.now();
    }
}
```

---

## Repository Query Examples

### ConversationRepository
```java
package com.my_app.schoolboard.repository;

import com.my_app.schoolboard.model.Conversation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @Query("SELECT c FROM Conversation c " +
           "WHERE (c.user1.id = :userId AND c.user2.id = :otherUserId) " +
           "OR (c.user1.id = :otherUserId AND c.user2.id = :userId)")
    Optional<Conversation> findConversationBetweenUsers(
        @Param("userId") Long userId,
        @Param("otherUserId") Long otherUserId
    );

    @Query("SELECT c FROM Conversation c " +
           "WHERE c.user1.id = :userId OR c.user2.id = :userId " +
           "ORDER BY c.updatedAt DESC")
    Page<Conversation> findUserConversations(
        @Param("userId") Long userId,
        Pageable pageable
    );

    @Query("SELECT c FROM Conversation c " +
           "LEFT JOIN FETCH c.lastMessage " +
           "WHERE c.user1.id = :userId OR c.user2.id = :userId " +
           "ORDER BY c.updatedAt DESC")
    Page<Conversation> findUserConversationsWithMessages(
        @Param("userId") Long userId,
        Pageable pageable
    );
}
```

### MessageRepository
```java
package com.my_app.schoolboard.repository;

import com.my_app.schoolboard.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface MessageRepository extends JpaRepository<Message, Long> {

    Page<Message> findByConversationIdOrderByCreatedAtDesc(
        Long conversationId,
        Pageable pageable
    );

    @Query("SELECT m FROM Message m " +
           "WHERE m.conversation.id = :conversationId " +
           "ORDER BY m.createdAt DESC")
    Page<Message> findMessagesInConversation(
        @Param("conversationId") Long conversationId,
        Pageable pageable
    );

    @Query("SELECT m FROM Message m " +
           "WHERE m.conversation.id = :conversationId " +
           "AND m.sender.id != :userId " +
           "AND m.isRead = false")
    List<Message> findUnreadMessages(
        @Param("conversationId") Long conversationId,
        @Param("userId") Long userId
    );

    @Query("SELECT COUNT(m) FROM Message m " +
           "WHERE m.conversation.id = :conversationId " +
           "AND m.sender.id != :userId " +
           "AND m.isRead = false")
    Integer countUnreadMessages(
        @Param("conversationId") Long conversationId,
        @Param("userId") Long userId
    );

    @Query("SELECT m FROM Message m " +
           "WHERE m.conversation.id = :conversationId " +
           "ORDER BY m.createdAt DESC LIMIT 1")
    Optional<Message> findLastMessage(
        @Param("conversationId") Long conversationId
    );

    @Modifying
    @Transactional
    @Query("UPDATE Message m " +
           "SET m.isRead = true, m.readAt = CURRENT_TIMESTAMP " +
           "WHERE m.conversation.id = :conversationId " +
           "AND m.sender.id != :userId " +
           "AND m.isRead = false")
    void markConversationAsRead(
        @Param("conversationId") Long conversationId,
        @Param("userId") Long userId
    );
}
```

---

## Service Implementation Snippets

### ConversationService
```java
package com.my_app.schoolboard.service;

import com.my_app.schoolboard.dto.ConversationDTO;
import com.my_app.schoolboard.dto.ConversationListItemDTO;
import com.my_app.schoolboard.model.Conversation;
import com.my_app.schoolboard.model.User;
import com.my_app.schoolboard.repository.ConversationRepository;
import com.my_app.schoolboard.repository.UserRepository;
import com.my_app.schoolboard.repository.MessageRepository;
import com.my_app.schoolboard.exception.ResourceNotFoundException;
import com.my_app.schoolboard.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final MessageRepository messageRepository;

    /**
     * Get or create a conversation between two users
     */
    public Conversation getOrCreateConversation(Long userId1, Long userId2) {
        if (userId1.equals(userId2)) {
            throw new IllegalArgumentException("Cannot create conversation with yourself");
        }

        // Ensure consistent ordering
        Long minUserId = Math.min(userId1, userId2);
        Long maxUserId = Math.max(userId1, userId2);

        return conversationRepository
            .findConversationBetweenUsers(minUserId, maxUserId)
            .orElseGet(() -> createConversation(minUserId, maxUserId));
    }

    private Conversation createConversation(Long userId1, Long userId2) {
        User user1 = userRepository.findById(userId1)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId1));
        User user2 = userRepository.findById(userId2)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId2));

        Conversation conversation = Conversation.builder()
            .user1(user1)
            .user2(user2)
            .build();

        return conversationRepository.save(conversation);
    }

    /**
     * Get all conversations for a user (paginated)
     */
    public Page<ConversationListItemDTO> getUserConversations(
            Long userId, Pageable pageable) {
        Page<Conversation> conversations = conversationRepository
            .findUserConversationsWithMessages(userId, pageable);

        return conversations.map(conv -> {
            User otherUser = conv.getOtherUser(userId);
            Integer unreadCount = messageRepository
                .countUnreadMessages(conv.getId(), userId);

            return ConversationListItemDTO.builder()
                .id(conv.getId())
                .otherUser(UserBasicDTO.fromUser(otherUser))
                .lastMessagePreview(getMessagePreview(conv.getLastMessage()))
                .lastMessageTime(conv.getUpdatedAt())
                .unreadCount(unreadCount)
                .build();
        });
    }

    /**
     * Get conversation with full message history
     */
    public ConversationDTO getConversationWithMessages(
            Long conversationId, Long userId, Pageable messagePaging) {
        Conversation conversation = conversationRepository.findById(conversationId)
            .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        if (!conversation.containsUser(userId)) {
            throw new UnauthorizedException("Access denied to this conversation");
        }

        // Mark as read
        messageRepository.markConversationAsRead(conversationId, userId);

        // Get message history
        Page<Message> messages = messageRepository
            .findMessagesInConversation(conversationId, messagePaging);

        return ConversationDTO.builder()
            .id(conversation.getId())
            .otherUser(UserBasicDTO.fromUser(conversation.getOtherUser(userId)))
            .messages(messages.getContent().stream()
                .map(MessageResponseDTO::fromMessage)
                .collect(Collectors.toList()))
            .unreadCount(0) // Already marked as read
            .build();
    }

    /**
     * Delete a conversation
     */
    public void deleteConversation(Long conversationId, Long userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
            .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        if (!conversation.containsUser(userId)) {
            throw new UnauthorizedException("Cannot delete this conversation");
        }

        conversationRepository.delete(conversation);
        log.info("Conversation {} deleted by user {}", conversationId, userId);
    }

    private String getMessagePreview(Message message) {
        if (message == null) return "(No messages yet)";
        String preview = message.getContent();
        return preview.length() > 50 ? preview.substring(0, 50) + "..." : preview;
    }
}
```

### MessageService
```java
package com.my_app.schoolboard.service;

import com.my_app.schoolboard.dto.MessageRequestDTO;
import com.my_app.schoolboard.dto.MessageResponseDTO;
import com.my_app.schoolboard.model.Conversation;
import com.my_app.schoolboard.model.Message;
import com.my_app.schoolboard.model.User;
import com.my_app.schoolboard.repository.ConversationRepository;
import com.my_app.schoolboard.repository.MessageRepository;
import com.my_app.schoolboard.repository.UserRepository;
import com.my_app.schoolboard.exception.ResourceNotFoundException;
import com.my_app.schoolboard.exception.UnauthorizedException;
import com.my_app.schoolboard.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessageService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final ChatWebSocketService webSocketService;

    private static final int MAX_MESSAGE_LENGTH = 5000;

    /**
     * Send a message in a conversation
     */
    @Transactional
    public MessageResponseDTO sendMessage(
            Long conversationId, Long senderId, String content) {
        
        // Validate content
        if (content == null || content.trim().isEmpty()) {
            throw new ValidationException("Message cannot be empty");
        }
        if (content.length() > MAX_MESSAGE_LENGTH) {
            throw new ValidationException("Message too long (max " + MAX_MESSAGE_LENGTH + " chars)");
        }

        // Verify conversation exists and user belongs to it
        Conversation conversation = conversationRepository.findById(conversationId)
            .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        if (!conversation.containsUser(senderId)) {
            throw new UnauthorizedException("User does not belong to this conversation");
        }

        User sender = userRepository.findById(senderId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Create and save message
        Message message = Message.builder()
            .conversation(conversation)
            .sender(sender)
            .content(content.trim())
            .isRead(false)
            .build();

        message = messageRepository.save(message);

        // Update conversation's lastMessage
        conversation.setLastMessage(message);
        conversationRepository.save(conversation);

        log.info("Message sent: ID={}, ConvID={}, SenderID={}", 
            message.getId(), conversationId, senderId);

        return MessageResponseDTO.fromMessage(message);
    }

    /**
     * Get messages from a conversation (paginated)
     */
    public Page<MessageResponseDTO> getMessages(
            Long conversationId, Long userId, Pageable pageable) {
        
        Conversation conversation = conversationRepository.findById(conversationId)
            .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        if (!conversation.containsUser(userId)) {
            throw new UnauthorizedException("Access denied");
        }

        Page<Message> messages = messageRepository
            .findMessagesInConversation(conversationId, pageable);

        return messages.map(MessageResponseDTO::fromMessage);
    }

    /**
     * Mark a message as read
     */
    public void markAsRead(Long messageId, Long userId) {
        Message message = messageRepository.findById(messageId)
            .orElseThrow(() -> new ResourceNotFoundException("Message not found"));

        if (message.getSender().getId().equals(userId)) {
            throw new ValidationException("Cannot mark own message as read");
        }

        message.markAsRead();
        messageRepository.save(message);
    }

    /**
     * Delete a message
     */
    @Transactional
    public void deleteMessage(Long messageId, Long userId) {
        Message message = messageRepository.findById(messageId)
            .orElseThrow(() -> new ResourceNotFoundException("Message not found"));

        if (!message.getSender().getId().equals(userId)) {
            throw new UnauthorizedException("Can only delete own messages");
        }

        messageRepository.delete(message);
        log.info("Message {} deleted by user {}", messageId, userId);
    }

    /**
     * Edit a message
     */
    @Transactional
    public MessageResponseDTO editMessage(
            Long messageId, Long userId, String newContent) {
        
        if (newContent == null || newContent.trim().isEmpty()) {
            throw new ValidationException("Message content cannot be empty");
        }

        Message message = messageRepository.findById(messageId)
            .orElseThrow(() -> new ResourceNotFoundException("Message not found"));

        if (!message.getSender().getId().equals(userId)) {
            throw new UnauthorizedException("Can only edit own messages");
        }

        message.setContent(newContent.trim());
        message = messageRepository.save(message);

        return MessageResponseDTO.fromMessage(message);
    }
}
```

---

## WebSocket Configuration

### WebSocketConfig
```java
package com.my_app.schoolboard.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable simple in-memory message broker for /topic and /queue
        config.enableSimpleBroker("/topic", "/queue");
        
        // Configure app destination prefix
        config.setApplicationDestinationPrefixes("/app");
        
        // Configure user destination prefix for private messages
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Register WebSocket endpoints
        registry.addEndpoint("/ws")
                .setAllowedOrigins("http://localhost:5173", "http://localhost:3000")
                .withSockJS();
        
        // Alternative without SockJS fallback:
        // registry.addEndpoint("/ws")
        //         .setAllowedOrigins("http://localhost:5173");
    }
}
```

### ChatController (WebSocket)
```java
package com.my_app.schoolboard.controller;

import com.my_app.schoolboard.dto.ChatMessageEvent;
import com.my_app.schoolboard.dto.TypingIndicatorEvent;
import com.my_app.schoolboard.service.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
public class ChatController {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.send")
    @SendTo("/topic/chat.{conversationId}")
    public ChatMessageResponseEvent sendMessage(
            @Payload ChatMessageEvent payload,
            Principal principal) {
        
        log.info("WebSocket message received: conversationId={}, senderId={}",
            payload.getConversationId(), payload.getSenderId());

        // Process message (this also saves to DB)
        String messageContent = payload.getContent();
        
        // Create response event
        return ChatMessageResponseEvent.builder()
            .conversationId(payload.getConversationId())
            .senderId(payload.getSenderId())
            .senderUsername(principal.getName())
            .content(messageContent)
            .timestamp(LocalDateTime.now())
            .build();
    }

    @MessageMapping("/chat.typing")
    @SendTo("/topic/chat.{conversationId}.typing")
    public TypingIndicatorEvent sendTypingIndicator(
            @Payload TypingIndicatorEvent payload) {
        
        log.debug("Typing indicator: conversationId={}, userId={}, isTyping={}",
            payload.getConversationId(), payload.getUserId(), payload.getIsTyping());
        
        return payload;
    }
}
```

### DTOs for WebSocket
```java
package com.my_app.schoolboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageEvent {
    private Long conversationId;
    private Long senderId;
    private String content;
    private LocalDateTime timestamp;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageResponseEvent {
    private Long conversationId;
    private Long senderId;
    private String senderUsername;
    private String content;
    private LocalDateTime timestamp;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TypingIndicatorEvent {
    private Long conversationId;
    private Long userId;
    private Boolean isTyping;
}
```

---

## Frontend - WebSocket Service

### webSocketService.js
```javascript
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

class WebSocketService {
    constructor() {
        this.stompClient = null;
        this.subscribers = {};
        this.connected = false;
    }

    connect(token, onConnected, onError) {
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const socket = new SockJS(`${import.meta.env.VITE_API_URL}/ws`);
        this.stompClient = Stomp.over(socket);

        this.stompClient.connect(
            headers,
            () => {
                this.connected = true;
                console.log('WebSocket connected');
                if (onConnected) onConnected();
            },
            (error) => {
                console.error('WebSocket connection error:', error);
                if (onError) onError(error);
            }
        );
    }

    sendMessage(conversationId, senderId, content) {
        if (!this.connected) {
            console.error('WebSocket not connected');
            return;
        }

        this.stompClient.send('/app/chat.send', {}, JSON.stringify({
            conversationId,
            senderId,
            content,
            timestamp: new Date().toISOString()
        }));
    }

    subscribeToConversation(conversationId, callback) {
        if (!this.connected) {
            console.error('WebSocket not connected');
            return null;
        }

        const subscription = this.stompClient.subscribe(
            `/topic/chat.${conversationId}`,
            (message) => {
                try {
                    const data = JSON.parse(message.body);
                    callback(data);
                } catch (error) {
                    console.error('Error parsing message:', error);
                }
            }
        );

        return subscription;
    }

    unsubscribe(subscription) {
        if (subscription) {
            subscription.unsubscribe();
        }
    }

    sendTypingIndicator(conversationId, userId, isTyping) {
        if (!this.connected) return;

        this.stompClient.send('/app/chat.typing', {}, JSON.stringify({
            conversationId,
            userId,
            isTyping
        }));
    }

    subscribeToTyping(conversationId, callback) {
        if (!this.connected) return null;

        return this.stompClient.subscribe(
            `/topic/chat.${conversationId}.typing`,
            (message) => {
                try {
                    const data = JSON.parse(message.body);
                    callback(data);
                } catch (error) {
                    console.error('Error parsing typing indicator:', error);
                }
            }
        );
    }

    disconnect() {
        if (this.stompClient) {
            this.stompClient.disconnect(() => {
                this.connected = false;
                console.log('WebSocket disconnected');
            });
        }
    }

    isConnected() {
        return this.connected;
    }
}

export const webSocketService = new WebSocketService();
```

### conversationAPI.js
```javascript
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL;

export const conversationAPI = {
    getConversations: (page = 0, size = 20) =>
        axios.get(`${API_BASE}/api/conversations`, {
            params: { page, size }
        }),

    getConversation: (conversationId, page = 0, size = 50) =>
        axios.get(`${API_BASE}/api/conversations/${conversationId}`, {
            params: { page, size }
        }),

    getOrCreateConversation: (otherUserId) =>
        axios.post(`${API_BASE}/api/conversations`, {
            otherUserId
        }),

    deleteConversation: (conversationId) =>
        axios.delete(`${API_BASE}/api/conversations/${conversationId}`),

    markAsRead: (conversationId) =>
        axios.put(`${API_BASE}/api/conversations/${conversationId}/read`),

    searchConversations: (keyword, page = 0, size = 20) =>
        axios.get(`${API_BASE}/api/conversations/search`, {
            params: { keyword, page, size }
        })
};
```

### messageAPI.js
```javascript
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL;

export const messageAPI = {
    sendMessage: (conversationId, content) =>
        axios.post(`${API_BASE}/api/messages`, {
            conversationId,
            content
        }),

    getMessages: (conversationId, page = 0, size = 50) =>
        axios.get(`${API_BASE}/api/messages/conversation/${conversationId}`, {
            params: { page, size }
        }),

    editMessage: (messageId, content) =>
        axios.put(`${API_BASE}/api/messages/${messageId}`, {
            content
        }),

    deleteMessage: (messageId) =>
        axios.delete(`${API_BASE}/api/messages/${messageId}`),

    markAsRead: (messageId) =>
        axios.put(`${API_BASE}/api/messages/${messageId}/read`)
};
```

---

## SQL Migration Script

### V001_add_chat_tables.sql
```sql
-- Create conversations table
CREATE TABLE conversations (
    id BIGSERIAL PRIMARY KEY,
    user1_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    last_message_id BIGINT REFERENCES messages(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user1_id, user2_id),
    CONSTRAINT users_not_same CHECK (user1_id < user2_id)
);

-- Create messages table
CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_conversations_user1 ON conversations(user1_id);
CREATE INDEX idx_conversations_user2 ON conversations(user2_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_is_read ON messages(conversation_id, is_read) WHERE is_read = false;
```

---

## Frontend - React Hooks

### useChat Hook
```javascript
import { useState, useEffect, useCallback } from 'react';
import { conversationAPI, messageAPI } from '../api';
import { webSocketService } from '../services/webSocketService';

export const useChat = (currentUserId) => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversationId, setSelectedConversationId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [typingUsers, setTypingUsers] = useState({});

    // Fetch conversations
    useEffect(() => {
        fetchConversations();
    }, []);

    // Subscribe to WebSocket when conversation selected
    useEffect(() => {
        if (!selectedConversationId) return;

        fetchMessages(selectedConversationId);

        const messageSubscription = webSocketService.subscribeToConversation(
            selectedConversationId,
            (newMessage) => {
                setMessages(prev => [newMessage, ...prev]);
            }
        );

        const typingSubscription = webSocketService.subscribeToTyping(
            selectedConversationId,
            (typingEvent) => {
                if (typingEvent.isTyping) {
                    setTypingUsers(prev => ({
                        ...prev,
                        [selectedConversationId]: [
                            ...new Set([...(prev[selectedConversationId] || []), typingEvent.userId])
                        ]
                    }));
                } else {
                    setTypingUsers(prev => {
                        const users = (prev[selectedConversationId] || [])
                            .filter(id => id !== typingEvent.userId);
                        return { ...prev, [selectedConversationId]: users };
                    });
                }
            }
        );

        return () => {
            webSocketService.unsubscribe(messageSubscription);
            webSocketService.unsubscribe(typingSubscription);
        };
    }, [selectedConversationId]);

    const fetchConversations = useCallback(async () => {
        try {
            setLoading(true);
            const response = await conversationAPI.getConversations();
            setConversations(response.data.content || response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchMessages = useCallback(async (conversationId) => {
        try {
            const response = await messageAPI.getMessages(conversationId);
            // Reverse to show oldest first
            setMessages((response.data.content || response.data).reverse());
        } catch (err) {
            setError(err.message);
        }
    }, []);

    const sendMessage = useCallback(async (conversationId, content) => {
        try {
            await messageAPI.sendMessage(conversationId, content);
            // Message will arrive via WebSocket
        } catch (err) {
            setError(err.message);
        }
    }, []);

    const startOrGetConversation = useCallback(async (otherUserId) => {
        try {
            const response = await conversationAPI.getOrCreateConversation(otherUserId);
            setSelectedConversationId(response.data.id);
            fetchConversations();
        } catch (err) {
            setError(err.message);
        }
    }, []);

    return {
        conversations,
        selectedConversationId,
        setSelectedConversationId,
        messages,
        loading,
        error,
        sendMessage,
        startOrGetConversation,
        fetchConversations,
        typingUsers
    };
};
```

---

## Testing - Postman Examples

### Create/Get Conversation
```
POST /api/conversations
Headers: Authorization: Bearer [JWT_TOKEN]
Body: {
  "otherUserId": 2
}

Response:
{
  "id": 1,
  "user1": { "id": 1, "username": "alice" },
  "user2": { "id": 2, "username": "bob" },
  "lastMessage": null,
  "unreadCount": 0
}
```

### Send Message
```
POST /api/messages
Headers: Authorization: Bearer [JWT_TOKEN]
Body: {
  "conversationId": 1,
  "content": "Hello, how are you?"
}

Response:
{
  "id": 1,
  "conversationId": 1,
  "sender": { "id": 1, "username": "alice" },
  "content": "Hello, how are you?",
  "createdAt": "2024-04-15T10:30:00",
  "isRead": false
}
```

### Get Messages
```
GET /api/messages/conversation/1?page=0&size=50
Headers: Authorization: Bearer [JWT_TOKEN]

Response:
{
  "content": [
    { ...message1 },
    { ...message2 }
  ],
  "pageable": { ... },
  "totalElements": 2
}
```


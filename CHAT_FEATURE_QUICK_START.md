# Chat Feature - Quick Start Implementation Checklist

## 🎯 Complete Implementation Steps

This document breaks down EXACTLY what to create, file by file, in the correct order.

---

## PHASE 1: DATABASE & ENTITIES (Backend)

### Step 1.1: Create SQL Migration (DB Schema)
**File**: `backend/src/main/resources/db/migration/V*_add_chat_tables.sql`

Create these tables in PostgreSQL:
- `conversations` table
- `messages` table
- All necessary indexes and constraints

### Step 1.2: Create Conversation Entity
```
File: backend/src/main/java/com/my_app/schoolboard/model/Conversation.java

Properties:
- Long id @Id @GeneratedValue
- User user1 @ManyToOne
- User user2 @ManyToOne
- LocalDateTime createdAt @CreationTimestamp
- LocalDateTime updatedAt @UpdateTimestamp
- Message lastMessage @OneToOne (nullable)

Methods:
- @PrePersist ensureUsers1IsLessThanUser2() to maintain user1_id < user2_id
- getOtherUser(Long userId) helper method
```

### Step 1.3: Create Message Entity
```
File: backend/src/main/java/com/my_app/schoolboard/model/Message.java

Properties:
- Long id @Id @GeneratedValue
- Conversation conversation @ManyToOne(fetch = LAZY)
- User sender @ManyToOne(fetch = LAZY)
- String content @Column(columnDefinition = "TEXT")
- LocalDateTime createdAt @CreationTimestamp
- LocalDateTime updatedAt @UpdateTimestamp
- Boolean isRead @Column defaultValue = false
- LocalDateTime readAt (nullable)

Annotations:
- @Entity @Table(name = "messages")
- Add @Index for: conversation_id, sender_id, created_at
```

---

## PHASE 2: REPOSITORIES (Backend)

### Step 2.1: Create ConversationRepository
```
File: backend/src/main/java/com/my_app/schoolboard/repository/ConversationRepository.java

Extends: JpaRepository<Conversation, Long>

Custom Methods:
- Optional<Conversation> findConversationBetweenUsers(Long user1, Long user2)
  Query: (u1 = ? AND u2 = ?) OR (u1 = ? AND u2 = ?)
  
- List<Conversation> findByUser(Long userId, Pageable pageable)
  Query: WHERE user1_id = userId OR user2_id = userId
  OrderBy: updated_at DESC
  
- Page<Conversation> findUserConversationsWithLastMessage(Long userId, Pageable p)
  (JPA Query with @Query annotation, include JOIN FETCH for lastMessage)
```

### Step 2.2: Create MessageRepository
```
File: backend/src/main/java/com/my_app/schoolboard/repository/MessageRepository.java

Extends: JpaRepository<Message, Long>

Custom Methods:
- Page<Message> findByConversationIdOrderByCreatedAtDesc(Long conversationId, Pageable p)

- List<Message> findUnreadMessagesForUser(Long userId, Long conversationId)
  Query: WHERE conversation_id = ? AND sender_id != ? AND is_read = false
  
- Message findLastMessageInConversation(Long conversationId)
  Query: SELECT * FROM messages WHERE conversation_id = ?
         ORDER BY created_at DESC LIMIT 1

- void markConversationMessagesAsRead(Long conversationId, Long userId)
  Update: is_read = true, read_at = NOW()
          WHERE conversation_id = ? AND sender_id != ? AND is_read = false
```

---

## PHASE 3: DTOs (Backend)

### Step 3.1: Create Message DTOs
```
File: backend/src/main/java/com/my_app/schoolboard/dto/MessageRequestDTO.java

Fields:
- Long conversationId (required)
- String content (required, max 5000 chars)
```

```
File: backend/src/main/java/com/my_app/schoolboard/dto/MessageResponseDTO.java

Fields:
- Long id
- Long conversationId
- UserBasicDTO sender (id, username, profileImageUrl)
- String content
- LocalDateTime createdAt
- Boolean isRead
- LocalDateTime readAt
```

```
File: backend/src/main/java/com/my_app/schoolboard/dto/UserBasicDTO.java
(Or reuse existing if available)

Fields:
- Long id
- String username
- String profileImageUrl
```

### Step 3.2: Create Conversation DTOs
```
File: backend/src/main/java/com/my_app/schoolboard/dto/ConversationDTO.java

Fields:
- Long id
- UserBasicDTO user1
- UserBasicDTO user2
- MessageResponseDTO lastMessage (nullable)
- Integer unreadCount
- LocalDateTime updatedAt
- List<MessageResponseDTO> messages (for detailed view)
```

```
File: backend/src/main/java/com/my_app/schoolboard/dto/ConversationListItemDTO.java

Fields (lightweight for list view):
- Long id
- UserBasicDTO otherUser (show the person you're chatting with)
- String lastMessagePreview (truncated, max 100 chars)
- LocalDateTime lastMessageTime
- Integer unreadCount
- LocalDateTime updatedAt
```

---

## PHASE 4: SERVICE LAYER (Backend)

### Step 4.1: Create ConversationService
```
File: backend/src/main/java/com/my_app/schoolboard/service/ConversationService.java

Methods to implement:

1. Conversation getOrCreateConversation(Long userId1, Long userId2)
   - Normalize users (ensure user1 < user2)
   - Query repository for existing
   - If not exists, create and save
   - Return conversation

2. Page<ConversationListItemDTO> getUserConversations(
        Long userId, Pageable pageable)
   - Get conversations for user
   - For each, construct ConversationListItemDTO
   - Include unread count
   - Return paginated

3. ConversationDTO getConversationWithMessages(
        Long conversationId, Long userId, Pageable messagePaging)
   - Verify user belongs to conversation
   - Fetch conversation
   - Fetch paginated messages
   - Build ConversationDTO
   - Call markConversationAsRead()
   - Return

4. void markConversationAsRead(Long conversationId, Long userId)
   - Call messageService to mark all messages as read

5. void deleteConversation(Long conversationId, Long userId)
   - Verify user owns conversation
   - Delete (or soft-delete)

6. Page<ConversationListItemDTO> searchConversations(
        Long userId, String keyword, Pageable pageable)
   - Search by username of other user or message content
   - Return matching conversations
```

### Step 4.2: Create MessageService
```
File: backend/src/main/java/com/my_app/schoolboard/service/MessageService.java

Methods to implement:

1. MessageResponseDTO sendMessage(
        Long conversationId, Long senderId, String content)
   - Validate sender belongs to conversation
   - Validate content not empty, max length 5000
   - Create Message entity
   - Save to repository
   - Update conversation's lastMessage_id and updated_at
   - Return MessageResponseDTO
   - [Will trigger WebSocket broadcast too]

2. Page<MessageResponseDTO> getMessages(
        Long conversationId, Long userId, Pageable pageable)
   - Verify user access to conversation
   - Fetch paginated messages
   - Convert to DTOs
   - Return with messages ordered oldest to newest

3. void markAsRead(Long messageId, Long userId)
   - Verify user is not sender
   - Set is_read = true, read_at = now
   - Save

4. void markConversationMessagesAsRead(Long conversationId, Long userId)
   - Mark all unread messages in conversation as read
   - By current user as recipient

5. void deleteMessage(Long messageId, Long userId)
   - Verify user is sender of message
   - Delete message
   - If it was lastMessage, update conversation's lastMessage_id

6. void editMessage(Long messageId, Long userId, String newContent)
   - Verify user is sender
   - Validate content
   - Update message content and updated_at
   - Save
```

---

## PHASE 5: CONTROLLER LAYER (Backend)

### Step 5.1: Create ConversationController
```
File: backend/src/main/java/com/my_app/schoolboard/controller/ConversationController.java

Endpoint: @RequestMapping("/api/conversations")

@GetMapping
public ResponseEntity<Page<ConversationListItemDTO>> getConversations(
    @PathVariable("page") int page,
    @PathVariable("size") int size,
    Authentication auth)
  - Extract userId from auth
  - Call conversationService.getUserConversations(userId, PageRequest.of(page, size))
  - Return ResponseEntity.ok(result)

@GetMapping("/{id}")
public ResponseEntity<ConversationDTO> getConversation(
    @PathVariable Long id,
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "50") int size,
    Authentication auth)
  - Extract userId from auth
  - Call service
  - Return

@PostMapping
public ResponseEntity<ConversationDTO> createOrGetConversation(
    @RequestBody CreateConversationRequestDTO request,
    Authentication auth)
  - Extract userId from auth
  - Call getOrCreateConversation(userId, request.otherUserId)
  - Return ResponseEntity.ok() with conversation

@DeleteMapping("/{id}")
public ResponseEntity<?> deleteConversation(
    @PathVariable Long id,
    Authentication auth)
  - Delete and return 200 OK

@PutMapping("/{id}/read")
public ResponseEntity<?> markAsRead(
    @PathVariable Long id,
    Authentication auth)
  - Mark conversation as read
  - Return 200 OK

@GetMapping("/search")
public ResponseEntity<Page<ConversationListItemDTO>> searchConversations(
    @RequestParam String keyword,
    @RequestParam(defaultValue = "0") int page,
    Authentication auth)
  - Search conversations
  - Return paginated results
```

### Step 5.2: Create MessageController
```
File: backend/src/main/java/com/my_app/schoolboard/controller/MessageController.java

Endpoint: @RequestMapping("/api/messages")

@PostMapping
public ResponseEntity<MessageResponseDTO> sendMessage(
    @RequestBody MessageRequestDTO request,
    Authentication auth)
  - Extract userId from auth
  - Validate request
  - Call messageService.sendMessage()
  - Broadcast via WebSocket
  - Return ResponseEntity.ok(messageDTO)

@GetMapping("/conversation/{conversationId}")
public ResponseEntity<Page<MessageResponseDTO>> getMessages(
    @PathVariable Long conversationId,
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "50") int size,
    Authentication auth)
  - Extract userId from auth
  - Call service to get paginated messages
  - Return

@GetMapping("/{id}")
public ResponseEntity<MessageResponseDTO> getMessage(
    @PathVariable Long id,
    Authentication auth)
  - Get specific message DTO
  - Return

@PutMapping("/{id}")
public ResponseEntity<MessageResponseDTO> editMessage(
    @PathVariable Long id,
    @RequestBody UpdateMessageRequestDTO request,
    Authentication auth)
  - Extract userId
  - Call service to edit
  - Broadcast via WebSocket
  - Return updated message

@DeleteMapping("/{id}")
public ResponseEntity<?> deleteMessage(
    @PathVariable Long id,
    Authentication auth)
  - Delete message
  - Broadcast deletion via WebSocket
  - Return 200 OK

@PutMapping("/{id}/read")
public ResponseEntity<?> markMessageAsRead(
    @PathVariable Long id,
    Authentication auth)
  - Mark as read
  - Return 200 OK
```

---

## PHASE 6: WEBSOCKET CONFIGURATION (Backend)

### Step 6.1: Add Dependencies
```
File: backend/pom.xml

Add:
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-messaging</artifactId>
</dependency>
```

### Step 6.2: Create WebSocket Configuration
```
File: backend/src/main/java/com/my_app/schoolboard/config/WebSocketConfig.java

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins("http://localhost:5173")
                .withSockJS();
    }
}
```

### Step 6.3: Create WebSocket Event Classes
```
File: backend/src/main/java/com/my_app/schoolboard/dto/ChatMessageEvent.java

Public fields:
- Long conversationId
- Long senderId
- String content
- LocalDateTime timestamp
```

```
File: backend/src/main/java/com/my_app/schoolboard/dto/TypingIndicatorEvent.java

Public fields:
- Long conversationId
- Long userId
- Boolean isTyping
```

### Step 6.4: Create WebSocket Handler
```
File: backend/src/main/java/com/my_app/schoolboard/service/ChatWebSocketService.java

@Service
public class ChatWebSocketService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    private MessageService messageService;

    public void sendMessage(ChatMessageEvent event) {
        // Broadcast to conversation subscribers
        messagingTemplate.convertAndSend(
            "/topic/chat." + event.getConversationId(),
            event
        );
    }

    public void sendTypingIndicator(TypingIndicatorEvent event) {
        // Notify conversation participants
        messagingTemplate.convertAndSend(
            "/topic/chat." + event.getConversationId() + ".typing",
            event
        );
    }
}
```

### Step 6.5: Create Message Handler Controller
```
File: backend/src/main/java/com/my_app/schoolboard/controller/ChatController.java

@RestController
public class ChatController {

    @Autowired
    private ChatWebSocketService webSocketService;

    @MessageMapping("/chat.send")
    public void handleMessage(@Payload ChatMessageEvent message,
                             Principal principal) {
        // message already captured from payload
        // Broadcast to all subscribers
        webSocketService.sendMessage(message);
    }

    @MessageMapping("/chat.typing")
    public void handleTyping(@Payload TypingIndicatorEvent event,
                            Principal principal) {
        webSocketService.sendTypingIndicator(event);
    }
}
```

---

## PHASE 7: FRONTEND - API SERVICES

### Step 7.1: Create API Service Files
```
File: frontend/src/api/conversationAPI.js

export const conversationAPI = {
    
    getConversations: (page = 0, size = 20) =>
        axios.get(`/api/conversations?page=${page}&size=${size}`),
    
    getConversation: (conversationId, page = 0, size = 50) =>
        axios.get(`/api/conversations/${conversationId}?page=${page}&size=${size}`),
    
    getOrCreateConversation: (otherUserId) =>
        axios.post(`/api/conversations`, { otherUserId }),
    
    deleteConversation: (conversationId) =>
        axios.delete(`/api/conversations/${conversationId}`),
    
    markAsRead: (conversationId) =>
        axios.put(`/api/conversations/${conversationId}/read`),
    
    searchConversations: (keyword, page = 0) =>
        axios.get(`/api/conversations/search?keyword=${keyword}&page=${page}`)
};
```

```
File: frontend/src/api/messageAPI.js

export const messageAPI = {
    
    sendMessage: (conversationId, content) =>
        axios.post(`/api/messages`, {
            conversationId,
            content
        }),
    
    getMessages: (conversationId, page = 0, size = 50) =>
        axios.get(`/api/messages/conversation/${conversationId}?page=${page}&size=${size}`),
    
    getMessage: (messageId) =>
        axios.get(`/api/messages/${messageId}`),
    
    editMessage: (messageId, content) =>
        axios.put(`/api/messages/${messageId}`, { content }),
    
    deleteMessage: (messageId) =>
        axios.delete(`/api/messages/${messageId}`),
    
    markAsRead: (messageId) =>
        axios.put(`/api/messages/${messageId}/read`)
};
```

### Step 7.2: Create WebSocket Service
```
File: frontend/src/services/webSocketService.js

import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

export class WebSocketService {
    constructor() {
        this.stompClient = null;
        this.subscribers = {};  // { conversationId: callbacks[] }
    }

    connect(onConnected) {
        const socket = new SockJS('http://localhost:8080/ws');
        this.stompClient = Stomp.over(socket);
        
        this.stompClient.connect({}, () => {
            console.log('WebSocket Connected');
            if (onConnected) onConnected();
        });
    }

    sendMessage(conversationId, senderId, content) {
        this.stompClient.send('/app/chat.send', {}, JSON.stringify({
            conversationId,
            senderId,
            content,
            timestamp: new Date().toISOString()
        }));
    }

    subscribeToConversation(conversationId, callback) {
        const subscription = this.stompClient.subscribe(
            `/topic/chat.${conversationId}`,
            (message) => {
                const messageData = JSON.parse(message.body);
                callback(messageData);
            }
        );
        
        if (!this.subscribers[conversationId]) {
            this.subscribers[conversationId] = [];
        }
        this.subscribers[conversationId].push(subscription);
    }

    sendTypingIndicator(conversationId, userId, isTyping) {
        this.stompClient.send('/app/chat.typing', {}, JSON.stringify({
            conversationId,
            userId,
            isTyping
        }));
    }

    subscribeToTyping(conversationId, callback) {
        this.stompClient.subscribe(
            `/topic/chat.${conversationId}.typing`,
            (message) => {
                callback(JSON.parse(message.body));
            }
        );
    }

    disconnect() {
        if (this.stompClient) {
            this.stompClient.disconnect();
        }
    }
}

export const webSocketService = new WebSocketService();
```

---

## PHASE 8: FRONTEND - REACT COMPONENTS

### Step 8.1: Refactor Messages.jsx
```
File: frontend/src/pages/Messages.jsx

Convert from mock data to real API:
- useState for selectedChat, conversations, messages, loading
- useEffect to fetch conversations on mount
- useEffect to fetch messages when selectedChat changes
- useWebSocket hook to connect/subscribe to WebSocket
- Pass data/handlers to child components
```

### Step 8.2: Create ConversationList Component
```
File: frontend/src/components/ConversationList.jsx

Props:
- conversations: []
- selectedConversationId: null
- onSelectConversation: (convId) => {}
- onSearch: (keyword) => {}

Features:
- Search bar at top
- Map and render each conversation
- Show avatar, name, last message preview
- Show unread badge
- Highlight selected conversation
```

### Step 8.3: Create ChatWindow Component
```
File: frontend/src/components/ChatWindow.jsx

Props:
- conversation: {}
- messages: []
- loadingMessages: boolean
- onSendMessage: (content) => {}
- onMarkAsRead: () => {}

Features:
- Display conversation header (other user info)
- Scroll to bottom for new messages
- Load more button for pagination
- Show typing indicators
- Handle message pagination
```

### Step 8.4: Create MessageItem Component
```
File: frontend/src/components/MessageItem.jsx

Props:
- message: {}
- isOwnMessage: bool
- onDelete: (messageId) => {}
- onEdit: (messageId, newContent) => {}

Features:
- Different styling for own vs other's messages
- Show sender info, timestamp
- Show read indicator (checkmarks, etc.)
- Edit/delete buttons on hover
```

### Step 8.5: Create MessageInput Component
```
File: frontend/src/components/MessageInput.jsx

Props:
- onSendMessage: (content) => {}
- onTyping: (isTyping) => {}
- disabled: boolean

Features:
- Textarea for message input
- Auto-expand textarea as user types
- Send button
- Emit typing indicator while typing (debounced)
```

### Step 8.6: Create TypingIndicator Component
```
File: frontend/src/components/TypingIndicator.jsx

Props:
- typingUsers: []

Features:
- Show "Alice is typing..." animatedively
- Multiple users typing: "Alice and Bob are typing..."
```

---

## 📋 TESTING CHECKLIST

### Backend Testing
- [ ] Test ConversationRepository queries with sample data
- [ ] Test MessageRepository pagination
- [ ] Test ConversationService business logic
- [ ] Test ConversationController endpoints with Postman
- [ ] Test MessageController endpoints with Postman
- [ ] Test WebSocket connection and message broadcast
- [ ] Manual testing: Create 2 users, send messages, verify in DB

### Frontend Testing
- [ ] Test conversation list loads correctly
- [ ] Test clicking conversation fetches messages
- [ ] Test sending message updates UI immediately
- [ ] Test real-time message arrival from other user
- [ ] Test pagination (load more messages)
- [ ] Test unread badge updates
- [ ] Test search conversations
- [ ] Test typing indicator appears

### Integration Testing
- [ ] Open chat on 2 browsers as 2 different users
- [ ] Send messages back and forth in real-time
- [ ] Verify messages persist in database
- [ ] Verify unread counts work correctly
- [ ] Refresh page and verify message history loads

---

## 🚀 DEPLOYMENT STEPS

1. **Database Migration**
   - Run SQL migration on production DB
   - Or let JPA auto-create tables (less recommended)

2. **Backend Deployment**
   - Package: `mvn clean package -DskipTests`
   - Deploy WAR/JAR file
   - Verify WebSocket port is accessible

3. **Frontend Deployment**
   - Build: `npm run build`
   - Deploy dist/ to static hosting
   - Update WebSocket URL in production

4. **Verification**
   - Test end-to-end in production environment
   - Monitor logs for errors
   - Load test WebSocket connections

---

## ⏱️ Estimated Timeline

- **Phase 1-2** (DB, Entities, Repos): 2-3 hours
- **Phase 3-4** (DTOs, Services): 3-4 hours
- **Phase 5** (Controllers): 2-3 hours
- **Phase 6** (WebSocket): 2-3 hours
- **Phase 7-8** (Frontend): 4-5 hours
- **Testing & Debugging**: 3-4 hours

**Total: ~20-25 hours of development**


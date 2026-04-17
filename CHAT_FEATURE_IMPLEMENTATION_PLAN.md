# 1-to-1 Chat Feature Implementation Plan

## 📋 Project Summary

**LearnLink (SchoolBoard)** is an academic networking platform built with:
- **Backend**: Spring Boot 4.0.2, Java 17, PostgreSQL, JWT Authentication, OAuth2
- **Frontend**: React 19.2, Vite, Tailwind CSS
- **Current Status**: Messaging UI exists with mock data; backend infrastructure completely missing

---

## 🎯 Feature Requirements: 1-to-1 Chat System

### Core Functionality
1. ✅ Real-time messaging between two users
2. ✅ Message history retrieval and pagination
3. ✅ User conversation list with last message preview
4. ✅ Unread message counter
5. ✅ Typing indicators (optional but recommended)
6. ✅ Online/Offline status (optional)
7. ✅ Message timestamps
8. ✅ Search conversations and message content

### Non-Functional Requirements
- Real-time updates via WebSocket
- Message persistence in PostgreSQL
- Support for JWT authenticated users
- Proper error handling and validation
- Scalable architecture for future features (group chats, etc.)

---

## 🏗️ Architecture Overview

### Database Schema

#### New Tables Required:
1. **`conversations`** - Represents 1-to-1 conversations
2. **`messages`** - Stores individual messages
3. **`conversation_participants`** - Maps users to conversations (for future scaling)

#### Table Definitions:

```sql
-- Conversations Table
CREATE TABLE conversations (
    id BIGSERIAL PRIMARY KEY,
    user1_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_message_id BIGINT,
    UNIQUE(user1_id, user2_id),
    CHECK (user1_id < user2_id)
);

-- Messages Table
CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP
);

-- Indexes for Performance
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_conversations_user1 ON conversations(user1_id);
CREATE INDEX idx_conversations_user2 ON conversations(user2_id);
```

### Backend Implementation Roadmap

#### Phase 1: Entity & Repository Layer
1. **Create Conversation Entity** (`model/Conversation.java`)
   - Fields: id, user1, user2, createdAt, updatedAt, lastMessage
   - Relationships: ManyToOne to User

2. **Create Message Entity** (`model/Message.java`)
   - Fields: id, conversation, sender, content, createdAt, sentAt, isRead, readAt
   - Relationships: ManyToOne to User and Conversation

3. **Create Repositories**
   - `ConversationRepository` with custom queries
   - `MessageRepository` with pagination and filtering

#### Phase 2: DTO Layer
1. **MessageRequestDTO**
   - sender_id, conversation_id, content

2. **MessageResponseDTO**
   - id, sender (UserDTO), content, createdAt, isRead, readAt

3. **ConversationDTO**
   - id, user1, user2, lastMessage, lastMessageTime, unreadCount, updatedAt

4. **ConversationListItemDTO** (lightweight for list view)
   - id, otherUser (simple user info), lastMessage, lastMessageTime, unreadCount

#### Phase 3: Service Layer
1. **ConversationService**
   - Methods:
     - `getOrCreateConversation(userId1, userId2)`
     - `getUserConversations(userId, page)`
     - `getConversationWithMessages(conversationId, page)`
     - `markConversationAsRead(conversationId, userId)`
     - `deleteConversation(conversationId, userId)`
     - `searchConversations(userId, keyword, page)`

2. **MessageService**
   - Methods:
     - `sendMessage(conversationId, senderId, content)`
     - `getMessages(conversationId, page)`
     - `markAsRead(messageId)`
     - `markConversationMessagesAsRead(conversationId, userId)`
     - `deleteMessage(messageId, userId)`
     - `editMessage(messageId, userId, newContent)`

#### Phase 4: Controller Layer
1. **ConversationController** (`/api/conversations`)
   - `GET /` - Get all conversations for current user
   - `GET /{id}` - Get conversation details with messages
   - `GET /with/{userId}` - Get/create conversation with specific user
   - `DELETE /{id}` - Delete conversation
   - `PUT /{id}/read` - Mark conversation as read
   - `GET /search` - Search conversations

2. **MessageController** (`/api/messages`)
   - `POST /` - Send message
   - `GET /conversation/{conversationId}` - Get messages with pagination
   - `GET /{id}` - Get single message
   - `PUT /{id}` - Edit message
   - `DELETE /{id}` - Delete message
   - `PUT /{id}/read` - Mark message as read

#### Phase 5: WebSocket Implementation
1. **WebSocket Configuration**
   - Add Spring WebSocket dependency to pom.xml
   - Create WebSocket configuration class
   - Configure STOMP messaging

2. **WebSocket Events**
   - `/app/chat.send` - Send message (processed by handler)
   - `/topic/chat.{conversationId}` - Subscribe to conversation updates
   - `/user/queue/notifications` - Private user queue for typing indicators

3. **Event Classes**
   - `ChatMessage.java` - Main message event
   - `TypingIndicator.java` - Typing notification
   - `OnlineStatus.java` - User online/offline status

4. **WebSocket Handler**
   - `ChatWebSocketHandler.java` or event listeners
   - Track active WebSocket sessions
   - Broadcast messages to conversation subscribers

### Frontend Implementation Roadmap

#### Phase 1: Components Refactoring
1. **Convert Messages.jsx** from mock data to real API
   - Fetch conversations from backend
   - Implement message pagination
   - Real-time message display

2. **Create Sub-Components**
   - `ConversationList.jsx` - List of conversations
   - `ChatWindow.jsx` - Active chat display
   - `MessageItem.jsx` - Individual message component
   - `MessageInput.jsx` - Input field with send button
   - `TypingIndicator.jsx` - Show user is typing

#### Phase 2: Real-time Features
1. **WebSocket Integration**
   - Create `webSocketService.js` for connection management
   - Setup STOMP client connection
   - Implement message subscription

2. **State Management** (using React hooks/Context)
   - Conversations state
   - Current chat state
   - Online users state
   - Typing indicators state

3. **Real-time Updates**
   - Listen for incoming messages via WebSocket
   - Update UI instantly without polling
   - Show typing indicators
   - Show online status

#### Phase 3: UI Enhancements
1. **Message Pagination**
   - Load more button or infinite scroll
   - Show message timestamps with humanized format

2. **Features**
   - Search conversations
   - Show unread badge count
   - Mark as read indicators (double checkmark, etc.)
   - Typing indicators
   - Online status indicator

---

## 📦 Required Dependencies

### Backend (pom.xml)
```xml
<!-- WebSocket -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>

<!-- STOMP -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-messaging</artifactId>
</dependency>
```

### Frontend (package.json)
```json
{
  "stompjs": "^2.3.3",
  "sockjs-client": "^1.6.1"
}
```

---

## 🔄 Implementation Phases (Sequential)

### Week 1: Backend Database & Core APIs
- [ ] Phase 1: Create Conversation & Message entities
- [ ] Phase 2: Create repositories with queries
- [ ] Phase 3: Create DTOs
- [ ] Phase 4: Implement services
- [ ] Test with Postman

### Week 2: Backend WebSocket & Frontend Integration
- [ ] Phase 5: Add WebSocket support
- [ ] Test WebSocket connections
- [ ] Frontend: Integrate with real APIs
- [ ] Set up WebSocket client

### Week 3: Frontend Features & Testing
- [ ] Phase 1-3: Complete frontend refactoring
- [ ] Real-time message display
- [ ] End-to-end testing
- [ ] Performance optimization

---

## 🔒 Security Considerations

1. **Authentication**
   - All endpoints require JWT token
   - Verify user owns the conversation

2. **Authorization**
   - Users can only access their own conversations
   - Users can only send messages to own conversations
   - Prevent other users from accessing conversation

3. **Data Validation**
   - Validate message content (not empty, max length)
   - Validate conversation ownership
   - Sanitize input to prevent XSS

4. **WebSocket Security**
   - Authenticate WebSocket handshake with JWT
   - Validate message sender against token
   - Rate limit message sending

---

## 🧪 Testing Strategy

### Backend Unit Tests
- Repository query tests
- Service logic tests
- Controller endpoint tests

### Integration Tests
- End-to-end message flow
- WebSocket connection flow
- Conversation creation flow

### Frontend Component Tests
- Messages component rendering
- Message sending/receiving
- Conversation list updates

---

## 📊 Performance Optimizations

1. **Database**
   - Proper indexes on frequently queried columns
   - Pagination for messages (load 20-50 at a time)
   - Lazy loading of user profiles

2. **Caching**
   - Cache conversation list for 5 minutes
   - Cache last message of each conversation
   - Redis for session storage (optional)

3. **Frontend**
   - Virtualization for long message lists
   - Lazy loading images in messages
   - Debouncing typing indicators
   - Efficient re-renders with React.memo

---

## 🚀 Deployment Considerations

1. **Database Migration**
   - Use Liquibase or Flyway for managing new tables
   - Or use Spring JPA auto-migration with caution

2. **WebSocket Scaling**
   - Use message broker (RabbitMQ/Redis) for distributed WebSocket
   - Sticky sessions if using multiple backend instances

3. **Frontend Build**
   - Build optimization for production
   - WebSocket URL configuration for different environments

---

## 📝 API Endpoint Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/conversations` | Get user's conversations |
| GET | `/api/conversations/{id}` | Get conversation with messages |
| POST | `/api/conversations` | Create/get-or-create conversation |
| DELETE | `/api/conversations/{id}` | Delete conversation |
| PUT | `/api/conversations/{id}/read` | Mark as read |
| GET | `/api/conversations/search` | Search conversations |
| POST | `/api/messages` | Send message |
| GET | `/api/messages/conversation/{id}` | Get messages (paginated) |
| PUT | `/api/messages/{id}` | Edit message |
| DELETE | `/api/messages/{id}` | Delete message |
| PUT | `/api/messages/{id}/read` | Mark as read |
| **WS** | `/ws` | WebSocket endpoint |
| **WS** | `/app/chat.send` | Send message via WebSocket |
| **WS** | `/topic/chat.{convId}` | Subscribe to conversation |

---

## 🎯 Success Criteria

✅ Users can see list of conversations
✅ Users can start 1-to-1 chat with any user
✅ Messages are sent and stored in database
✅ Real-time message delivery via WebSocket
✅ Message history is retrievable
✅ Unread message counter works
✅ Last message preview in conversation list
✅ Proper error handling and validation
✅ Security checks for data access
✅ All endpoints tested and documented

---

## 📚 Additional Notes

- Consider file upload support for messages later (images, documents)
- Consider message reactions (emoji reactions) as future enhancement
- Consider group chat extension of this 1-to-1 implementation
- Monitor WebSocket connections for memory leaks
- Implement message read receipts for better UX


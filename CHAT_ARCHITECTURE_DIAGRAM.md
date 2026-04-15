# Chat Feature - Visual Architecture & Data Flow

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                             │
├─────────────────────────────────────────────────────────────────────┤
│  Messages.jsx (Main)                                                 │
│  ├── ConversationList.jsx (List sidebar)                            │
│  ├── ChatWindow.jsx (Message display area)                          │
│  │   ├── MessageItem.jsx (Rendered messages)                        │
│  │   └── TypingIndicator.jsx (User typing...)                       │
│  └── MessageInput.jsx (Input + Send button)                         │
│                                                                       │
│  Services:                                                           │
│  ├── conversationAPI.js (REST calls)                                │
│  ├── messageAPI.js (REST calls)                                     │
│  └── webSocketService.js (Real-time via STOMP)                      │
└──────────────────┬──────────────────────────────────────────────────┘
                   │ HTTP (REST API) + WebSocket (STOMP)
                   │
┌──────────────────▼──────────────────────────────────────────────────┐
│                    BACKEND (Spring Boot)                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  API Layer:                                                          │
│  ├── ConversationController                                         │
│  │   ├── GET /api/conversations                                     │
│  │   ├── GET /api/conversations/{id}                               │
│  │   ├── POST /api/conversations                                    │
│  │   └── DELETE /api/conversations/{id}                            │
│  │                                                                   │
│  └── MessageController                                              │
│      ├── POST /api/messages                                         │
│      ├── GET /api/messages/conversation/{id}                       │
│      ├── PUT /api/messages/{id}                                     │
│      └── DELETE /api/messages/{id}                                  │
│                                                                       │
│  WebSocket Layer:                                                    │
│  └── ChatWebSocketHandler                                           │
│      ├── /app/chat.send (Message endpoint)                         │
│      ├── /topic/chat.{conversationId} (Subscription)               │
│      └── /user/queue/notifications (Typing indicators)             │
│                                                                       │
│  Service Layer:                                                      │
│  ├── ConversationService                                            │
│  │   ├── getOrCreateConversation()                                  │
│  │   ├── getUserConversations()                                     │
│  │   └── searchConversations()                                      │
│  │                                                                   │
│  └── MessageService                                                 │
│      ├── sendMessage()                                              │
│      ├── getMessages()                                              │
│      └── markAsRead()                                               │
│                                                                       │
│  Repository Layer:                                                   │
│  ├── ConversationRepository                                         │
│  └── MessageRepository                                              │
│                                                                       │
│  Entity Layer:                                                       │
│  ├── Conversation (JPA Entity)                                      │
│  └── Message (JPA Entity)                                           │
│                                                                       │
└──────────────────┬──────────────────────────────────────────────────┘
                   │ JDBC/JPA
                   │
┌──────────────────▼──────────────────────────────────────────────────┐
│                 DATABASE (PostgreSQL)                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  users (existing)                                                    │
│  ├── id (PK)                                                         │
│  ├── username                                                        │
│  ├── email                                                           │
│  └── ...other fields                                                 │
│                                                                       │
│  conversations (NEW)                                                 │
│  ├── id (PK)                                                         │
│  ├── user1_id (FK to users)                                         │
│  ├── user2_id (FK to users)                                         │
│  ├── created_at                                                      │
│  ├── updated_at                                                      │
│  └── last_message_id (FK to messages)                               │
│                                                                       │
│  messages (NEW)                                                      │
│  ├── id (PK)                                                         │
│  ├── conversation_id (FK to conversations)                          │
│  ├── sender_id (FK to users)                                        │
│  ├── content (TEXT)                                                  │
│  ├── created_at                                                      │
│  ├── is_read (BOOLEAN)                                              │
│  ├── read_at                                                         │
│  └── updated_at                                                      │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow: Sending a Message (Real-time)

```
User A Types & Sends Message
│
├─ Frontend: MessageInput.jsx captures text
│
├─ POST /api/messages (REST - persist to DB)
│  │
│  └—> Backend: MessageController.sendMessage()
│      │
│      └—> MessageService.sendMessage()
│          │
│          ├—> Create Message entity
│          ├—> Save to MessageRepository
│          └—> Return MessageResponseDTO
│
├─ WebSocket: Send via /app/chat.send (STOMP)
│  │
│  └—> Backend: ChatWebSocketHandler
│      │
│      ├—> Process message
│      ├—> Add to conversation context
│      └—> Broadcast to /topic/chat.{conversationId}
│
└─ Frontend: TypingIndicator.jsx subscribes to /topic/chat.{conversationId}
   │
   └—> Real-time Message appears in ChatWindow.jsx
```

## Conversation Retrieval Flow (with Pagination)

```
User opens Messages page
│
├─ GET /api/conversations?page=0&size=20
│  │
│  └—> Backend: ConversationController
│      │
│      ├—> Get userId from JWT token
│      │
│      └—> ConversationService.getUserConversations(userId, page)
│          │
│          ├—> Query from ConversationRepository
│          │   SELECT * FROM conversations 
│          │   WHERE (user1_id = userId OR user2_id = userId)
│          │   ORDER BY updated_at DESC
│          │   LIMIT 20
│          │
│          ├—> Enrich with lastMessage
│          ├—> Calculate unreadCount
│          └—> Return List<ConversationListItemDTO>
│
└—> Frontend: Render in ConversationList.jsx
    │
    └—> Show:
        ├— Other user's avatar & name
        ├— Last message preview
        ├— Time of last message
        └— Unread badge (if any)
```

## Message History Loading with Pagination

```
User clicks on conversation
│
├─ GET /api/conversations/{conversationId}?page=0&size=50
│  │
│  └—> Backend: ConversationController
│      │
│      └—> ConversationService.getConversationWithMessages()
│          │
│          ├—> Verify user access (security)
│          │
│          ├—> Query messages:
│          │   SELECT * FROM messages 
│          │   WHERE conversation_id = {id}
│          │   ORDER BY created_at DESC
│          │   LIMIT 50
│          │
│          ├—> Mark all messages as read for current user
│          │
│          └—> Return ConversationDTO with message history
│
└—> Frontend: 
    │
    ├—> Reverse message order (oldest first)
    ├—> Subscribe to WebSocket: /topic/chat.{conversationId}
    └—> Render in ChatWindow.jsx
        │
        └—> New messages appear in real-time via WebSocket
```

## User Authentication & Security Flow

```
User initiates chat
│
├─ JWT Token from Authentication (existing system)
│  │
│  └—> Included in all API requests as Bearer token
│
├—> Backend receives request
│   │
│   └—> JwtAuthenticationFilter validates token
│       │
│       ├—> Extract userId from token
│       ├—> Verify token not expired
│       └—> Set in Spring Security context
│
├—> Endpoint method receives Authentication
│   │
│   ├—> Verify userId ownership of conversation
│   │   (Only access if userId is user1 or user2)
│   │
│   └—> Allow/Deny operation
│
└—> WebSocket connection
    │
    ├—> Authenticate handshake with JWT
    │   (Token passed in query param or header)
    │
    └—> Validate each message sender against token
```

## Entity Relationship Diagram

```
┌─────────────┐
│    User     │
├─────────────┤
│ id (PK)     │
│ username    │
│ email       │
│ ...         │
└──────┬──────┘
       │ (1:N)
       │
       ├─────────────────────────────────┐
       │                                 │
       ▼                                 ▼
┌─────────────────┐          ┌─────────────────┐
│ Conversation    │          │    Message      │
├─────────────────┤          ├─────────────────┤
│ id (PK)         │◄─────┐   │ id (PK)         │
│ user1_id (FK)   │      └───│ conversation_id │
│ user2_id (FK)   │          │ sender_id (FK)  │
│ created_at      │          │ content (TEXT)  │
│ updated_at      │          │ created_at      │
│ last_message_id │──┐       │ is_read         │
└─────────────────┘  │       │ read_at         │
                     │       └─────────────────┘
                     │
                     └──── (1:1 relationship)
                          last message of conversation
```

## WebSocket Message Format (STOMP)

```
// Client sends message
SEND
destination:/app/chat.send
content-length:180

{
  "conversationId": 1,
  "senderId": 123,
  "content": "Hey, how are you?",
  "timestamp": "2024-04-15T10:30:00Z"
}

// Server broadcasts to subscribers
MESSAGE
destination:/topic/chat.1
message-id:ID:spring-websocket-1
subscription:sub-1

{
  "id": 456,
  "conversationId": 1,
  "sender": {
    "id": 123,
    "username": "john_doe",
    "avatar": "url"
  },
  "content": "Hey, how are you?",
  "createdAt": "2024-04-15T10:30:00Z",
  "isRead": false
}
```

## State Management (Frontend)

```
MessagesContext (Global State)
│
├── conversations: [
│   {
│     id: 1,
│     user2: { id: 2, username: "alice", avatar: "..." },
│     lastMessage: "See you tomorrow",
│     lastMessageTime: "2024-04-15T10:30:00Z",
│     unreadCount: 2,
│     messages: [
│       { id: 1, sender: { id: 2 }, content: "Hi", createdAt, isRead: true },
│       { id: 2, sender: { id: 1 }, content: "Hello", createdAt, isRead: true }
│     ]
│   }
│ ]
│
├── selectedConversationId: 1
│
├── typingUsers: {
│   1: [2]  // In conversation 1, user 2 is typing
│ }
│
├── onlineUsers: [2, 3, 5]  // Users currently online
│
├── loading: false
│
└── error: null
```


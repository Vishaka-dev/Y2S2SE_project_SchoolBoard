# GROUP CHAT FEATURE - IMPLEMENTATION PLAN

**Date**: April 19, 2026  
**Status**: Planning Phase Ready  
**Estimated Effort**: 27 hours (3-4 days)  
**Current Status**: Analysis Complete ✅

---

## 📋 EXECUTIVE SUMMARY

This document outlines the complete implementation plan for adding **Group Chat** functionality to the SchoolBoard application. The feature will allow members of a group to communicate in real-time through a shared message channel, similar to the existing 1-to-1 messaging but extended for multiple participants.

**Current State**: 1-to-1 messaging system fully implemented and working  
**New Feature**: Group Chat within study groups  
**Architecture**: Build on existing WebSocket/STOMP infrastructure

---

## 🎯 FEATURE OVERVIEW

### What Users Can Do:
1. ✅ Access group chat by clicking "Chat" button on group view page
2. ✅ Access group chat from Messages page (new "Group Chats" section)
3. ✅ See group name in the chat header
4. ✅ Send messages that appear in real-time to all group members
5. ✅ View messages from others on the left, own messages on the right
6. ✅ See profile picture with each message bubble
7. ✅ See typing indicators when others are typing
8. ✅ Delete own messages (with confirmation)
9. ✅ Upload file attachments to messages
10. ✅ See online status of group members

---

## 📐 SYSTEM ARCHITECTURE

### Backend Data Model:

```
StudyGroup (existing)
    ↓
GroupConversation (NEW)
    ├─ Many GroupMessages
    ├─ Links to StudyGroup
    └─ Tracks lastMessage

GroupMessage (NEW)
    ├─ sender (User)
    ├─ content (TEXT)
    ├─ Many GroupAttachments
    └─ timestamps (created_at, updated_at)

GroupMember (existing)
    └─ Determines who can access chat
```

### Frontend Component Structure:

```
/group-chat/:groupId
    │
    ├─ GroupChatWindow (header + message display)
    │  ├─ Header: [Group Info] [Member Count] [Menu]
    │  └─ Messages: [ProfilePic][Bubble]
    │
    ├─ GroupMessageInput (message composer)
    │  ├─ Text input
    │  ├─ File attachment
    │  └─ Send button
    │
    └─ WebSocket Subscriptions
       ├─ /topic/group-chat.{groupId}
       └─ /topic/group-chat.{groupId}.typing
```

### Real-Time Data Flow:

```
User A sends message
    ↓
POST /api/group-messages → Save to DB
    ↓
Publish: /app/group-chat.send
    ↓
Server broadcasts: /topic/group-chat.{groupId}
    ↓
User B, C, D receive in WebSocket
    ↓
Update UI with new message (with profile pic)
```

---

## 🔄 USER FLOWS

### Flow 1: Starting Group Chat from Group View

```
User visits group (e.g., /groups/123)
    ↓
User is member? (checks GroupMember role)
    ↓
YES → Show "Chat" button in header
    ↓
Click "Chat" button
    ↓
Navigate to /group-chat/123
    ↓
Load group info (name, members count)
    ↓
Load message history (last 30 messages)
    ↓
Subscribe to WebSocket: /topic/group-chat.123
    ↓
Display chat interface
```

### Flow 2: Accessing via Messages Page

```
Messages.jsx page (current 1-to-1 chat)
    ↓
Add new "Group Chats" tab/section
    ↓
List all groups user is member of
    ↓
Click on group → /group-chat/{groupId}
    ↓
Same loading process as Flow 1
```

### Flow 3: Sending a Message

```
User types message
    ↓
User clicks Send
    ↓
Validate: not empty, length ≤ 5000 chars
    ↓
REST API: POST /api/group-messages
  payload: {groupConversationId, content}
    ↓
Backend: Verify user is GroupMember
    ↓
Save to database as GroupMessage
    ↓
WebSocket broadcast: /topic/group-chat.{groupId}
    ↓
All members receive in real-time
    ↓
Update UI with sender's profile + username + message
```

---

## 📦 BACKEND IMPLEMENTATION

### 1. New Models (Java)

#### GroupConversation.java
- Primary key: id
- Foreign keys: studyGroup_id, lastMessage_id
- Fields: createdAt, updatedAt
- Relationships: OneToMany with GroupMessage

#### GroupMessage.java
- Primary key: id
- Foreign keys: groupConversation_id, sender_id
- Fields: content (TEXT), isRead, readAt, createdAt, updatedAt
- Relationships: OneToMany with GroupAttachment

#### GroupAttachment.java (Optional but recommended)
- Similar to existing Attachment but for group messages
- Foreign key: groupMessage_id

### 2. New API Endpoints

```
GET  /api/group-conversations/{groupId}
     → Get/create group conversation

GET  /api/group-messages/conversation/{conversationId}?page=0&size=20
     → Fetch messages (paginated)

POST /api/group-messages
     payload: {groupConversationId, content}
     → Send message

DELETE /api/group-messages/{messageId}
     → Delete own message

POST /api/group-messages/{messageId}/attachments
     → Upload attachment

PUT  /api/group-messages/{messageId}/read
     → Mark as read (optional)
```

### 3. WebSocket Endpoints

```
Client sends to:
  /app/group-chat.send
    payload: {groupId, senderId, content, timestamp}

Server broadcasts to:
  /topic/group-chat.{groupId}
    payload: {id, senderId, senderUsername, content, 
              senderProfilePic, createdAt, ...}

---

Client sends to:
  /app/group-chat.typing
    payload: {groupId, userId, isTyping}

Server broadcasts to:
  /topic/group-chat.{groupId}.typing
    payload: {userId, username, isTyping}
```

### 4. Security Checks

✅ All endpoints must verify:
- User is authenticated (JWT)
- User is member of the group
- User has permission (all members can chat, admin/owner can moderate)

```java
// Example check
if (!groupMemberRepository.existsByGroup_IdAndUser_Id(groupId, userId)) {
    throw new UnauthorizedException("Not a group member");
}
```

---

## 🎨 FRONTEND IMPLEMENTATION

### 1. New Route

```javascript
// App.jsx
import GroupMessages from './pages/GroupMessages';

<Route path="/group-chat/:groupId" element={<GroupMessages />} />
```

### 2. New API Service Files

#### groupConversationAPI.js
```javascript
getOrCreateGroupConversation(groupId)
fetchGroupMessages(conversationId, page, size)
```

#### groupMessageAPI.js
```javascript
sendMessage(groupConversationId, content)
fetchMessages(groupConversationId, page, size)
deleteMessage(messageId)
uploadAttachment(messageId, file)
```

### 3. New Components

```
src/components/groupchat/
├── GroupChatWindow.jsx
│   - Header with group name & member count
│   - Message display area with scrolling
│   - Typing indicator
│   - Menu (leave group, info)
│
├── GroupMessageBubble.jsx
│   - Profile picture (left-aligned for others)
│   - Username + timestamp
│   - Message content
│   - Delete button (if own message)
│
├── GroupMessageInput.jsx
│   - Text input field
│   - File attachment button
│   - Send button with loading state
│
└── GroupMembersPanel.jsx (optional)
    - Show online members
    - Member list
```

### 4. New Page

#### src/pages/GroupMessages.jsx
```javascript
Main orchestrator component:
- Load group info & members
- Fetch message history
- Manage WebSocket subscriptions
- Handle sending/receiving messages
- Manage UI state (loading, error, etc.)
```

### 5. WebSocket Service Updates

Add to webSocketService.js:
```javascript
subscribeToGroupChat(groupId, onMessage)
subscribeToGroupTyping(groupId, onTyping)
sendGroupMessage(groupId, senderId, content)
sendGroupTypingIndicator(groupId, userId, isTyping)
unsubscribeFromGroupChat(groupId)
```

---

## 🖼️ UI MOCKUP

### Chat Header
```
┌─────────────────────────────────────────────────────┐
│ [Group Icon]  Group Name        👥 5 members  ⋯    │
└─────────────────────────────────────────────────────┘
```

### Message Area (with Mixed Users)

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│                 [Alice's Message]                  │
│                 Right-aligned bubble               │
│                 12:30 PM                           │
│                                                     │
│ 👤 Bob                                              │
│    [Bob's Message]                                 │
│    Left-aligned bubble                            │
│    12:31 PM                                        │
│                                                     │
│ 👤 Charlie                                          │
│    [Charlie's Message]                            │
│    Left-aligned bubble                            │
│    12:32 PM                                        │
│                                                     │
│ 👤 Bob is typing...                                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Message Input

```
┌─────────────────────────────────────────────────────┐
│ [📎 Attach]  [Message input field...]  [Send ➤]   │
└─────────────────────────────────────────────────────┘
```

---

## 📋 IMPLEMENTATION PHASES

### Phase 1: Backend Models & Database (2-3 hours)
- [ ] Create `GroupConversation` entity
- [ ] Create `GroupMessage` entity
- [ ] Create `GroupAttachment` entity (optional)
- [ ] Create repositories
- [ ] Database migrations

### Phase 2: Backend Services & API (4-5 hours)
- [ ] Create `GroupMessageService`
- [ ] Create `GroupConversationService`
- [ ] Create REST Controller
- [ ] Add validation & security checks
- [ ] Create DTOs

### Phase 3: WebSocket Integration (3-4 hours)
- [ ] Extend WebSocket config
- [ ] Create `GroupChatWebSocketController`
- [ ] Add message handlers
- [ ] Add typing indicator handlers
- [ ] Test with Postman

### Phase 4: Frontend Services (2 hours)
- [ ] Create API service files
- [ ] Update WebSocket service
- [ ] Add route

### Phase 5: Frontend UI Components (5-6 hours)
- [ ] Create `GroupMessages.jsx` page
- [ ] Create message display components
- [ ] Create input component
- [ ] Add navigation/routing

### Phase 6: Integration & Testing (3-4 hours)
- [ ] End-to-end testing
- [ ] Bug fixes
- [ ] Performance optimization
- [ ] User testing

---

## ❓ CLARIFICATIONS NEEDED

Before starting implementation, please clarify:

### 1. **Online Status & Presence**
   - ❓ Show green dot for online members in group?
   - ❓ Show which specific user is typing (vs just "someone is typing")?

### 2. **Message Features**
   - ❓ Allow editing messages?
   - ❓ Show read receipts (✓✓)?
   - ❓ Owner/admin delete any message or only own?
   - ❓ Mark deleted messages as "[deleted]" or truly remove?

### 3. **Group Permissions**
   - ❓ All members can send or only certain roles?
   - ❓ Owner/admin ability to moderate (mute/kick)?
   - ❓ Admin ability to delete member messages?

### 4. **Message History**
   - ❓ Can new members see all previous messages?
   - ❓ Archive/hide old messages support?

### 5. **Features (Priority)**
   - ❓ Message search within group?
   - ❓ Pinned important messages?
   - ❓ @mentions support?
   - ❓ Reactions/emoji support?

### 6. **Performance**
   - ❓ Expected group size (10, 100, 1000+ members)?
   - ❓ Any pagination/optimization requirements?

### 7. **UI Placement**
   - ❓ Should "Group Chats" tab appear in existing Messages.jsx?
   - ❓ Or separate route like Messages page?
   - ❓ Member list panel always visible or toggle-able?

---

## 🔐 Security & Validation

### Frontend Validation
- ✅ Message not empty
- ✅ Message ≤ 5000 characters
- ✅ File size ≤ 5MB per attachment
- ✅ User must be authenticated

### Backend Validation
- ✅ Verify JWT token
- ✅ Verify user is group member
- ✅ Validate message content
- ✅ Validate file types/sizes
- ✅ Rate limit message sending (optional)

### Database Constraints
- ✅ Foreign keys with cascade delete
- ✅ NOT NULL constraints on required fields
- ✅ Indexes on frequently queried columns

---

## 📊 ESTIMATED EFFORT

| Phase | Component | Hours | Risk |
|-------|-----------|-------|------|
| 1 | Models & DB | 3 | Low |
| 2 | Backend Services | 5 | Low |
| 3 | WebSocket | 4 | Medium |
| 4 | Frontend Services | 2 | Low |
| 5 | UI Components | 6 | Medium |
| 6 | Integration & Testing | 4 | Medium |
| **TOTAL** | | **24-27h** | |

**Timeline**: 3-4 business days (full-time development)

---

## ✅ VERIFICATION CHECKLIST

Before deployment, verify:

### Backend
- [ ] All endpoints respond correctly
- [ ] Member access control working
- [ ] WebSocket messages broadcast correctly
- [ ] File uploads working
- [ ] Database transactions atomic
- [ ] Error handling proper
- [ ] Logging adequate

### Frontend
- [ ] Group chat loads correctly
- [ ] Messages send and receive in real-time
- [ ] Typing indicators work
- [ ] Profile pictures display
- [ ] Auto-scroll to latest message
- [ ] Navigation between chat/group works
- [ ] File attachments upload/display
- [ ] Responsive design (mobile/tablet/desktop)

### Integration
- [ ] End-to-end message flow works
- [ ] Multiple users can chat simultaneously
- [ ] WebSocket reconnection handles properly
- [ ] Pagination works for old messages
- [ ] Performance acceptable with large group size

---

## 📱 NAVIGATION FLOWS

### Entry Point 1: From GroupDetails Page
```
GroupDetails.jsx
    ↓
Add "Chat" button next to "Join/Leave" buttons
    ↓
Visible only if user.isMember
    ↓
onClick → navigate(`/group-chat/${groupId}`)
```

### Entry Point 2: From Messages Page
```
Messages.jsx (current 1-to-1 messaging)
    ↓
Add "Group Chats" tab in ConversationList header
    ↓
Shows list of groups user is member of
    ↓
Click group → navigate(`/group-chat/${groupId}`)
```

### Entry Point 3: Direct URL
```
User bookmarks or shares: /group-chat/123
    ↓
Page loads GroupMessages
    ↓
Verify membership on load
    ↓
If not member → redirect to GroupDetails with join option
```

---

## 🚀 NEXT STEPS

1. **Review this plan** with user and get clarifications
2. **Prioritize clarifications** (especially permissions & features)
3. **Create feature branches** for backend and frontend
4. **Start with backend** (models first, test with Postman)
5. **Implement frontend** in parallel
6. **Integration testing** once backend ready
7. **User acceptance testing** before deployment

---

## 📞 SUPPORT & QUESTIONS

For questions during implementation:
- Reference existing 1-to-1 messaging code for patterns
- Use WebSocket logs for real-time debugging
- Check GroupMember table for permission queries
- Test endpoints with Postman before frontend integration

---

**Document Version**: 1.0  
**Last Updated**: April 19, 2026  
**Prepared For**: Implementation Phase

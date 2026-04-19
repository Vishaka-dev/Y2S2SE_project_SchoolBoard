# Group Chat Frontend Implementation Guide

## Overview
This document provides a comprehensive guide to the frontend group chat implementation, including component structure, service integration, and WebSocket communication.

## Components

### 1. GroupMessageBubble.jsx
**Purpose**: Displays individual messages with sender information and profile pictures.

**Features**:
- Message content display
- Sender profile picture and username
- Timestamp formatting
- Message menu (copy, delete)
- Own messages vs other users' messages (different styling)

**Props**:
```jsx
{
  message: {
    id: number,
    content: string,
    sender: {
      id: number,
      username: string,
      profileImageUrl: string
    },
    createdAt: string // ISO datetime
  },
  isOwn: boolean,           // Is current user's message
  currentUserId: number,    // Current user ID
  onDelete: function        // Delete callback
}
```

**Styling**:
- Own messages: Blue background, right-aligned
- Other messages: Gray background, left-aligned with avatar
- Hover menu with copy and delete options

---

### 2. GroupMessageInput.jsx
**Purpose**: Input field for composing and sending group messages.

**Features**:
- Textarea with auto-expand
- File attachment support (icon placeholder)
- Typing indicator
- Send button with loading state
- Keyboard shortcuts (Enter to send, Shift+Enter for newline)

**Props**:
```jsx
{
  onSend: function,         // Send callback
  onTyping: function,       // Typing indicator callback
  disabled: boolean,        // Disable input
  isLoading: boolean        // Loading state
}
```

**Keyboard**:
- Enter: Send message
- Shift+Enter: New line
- Tab: File input focus

---

### 3. GroupChatWindow.jsx
**Purpose**: Main chat display area with message history and typing indicators.

**Features**:
- Message thread display
- Chat header with group info
- Typing indicators
- Group menu (view details, leave group)
- Leave group confirmation modal
- Auto-scroll to latest messages

**Props**:
```jsx
{
  group: {
    id: number,
    groupId: number,
    groupName: string,
    groupProfilePictureUrl: string,
    memberCount: number
  },
  messages: array,
  currentUserId: number,
  typingUsers: Set,                    // Set of typing user IDs
  messagesEndRef: React.ref,
  onDeleteMessage: function,
  onLeaveGroup: function
}
```

---

### 4. GroupTypingIndicator.jsx
**Purpose**: Visual indicator for users typing in the group.

**Features**:
- Animated dots
- User count display
- Smooth fade-in/out

**Props**:
```jsx
{
  typingUsers: Set      // Set of typing user IDs
}
```

---

### 5. GroupChatList.jsx
**Purpose**: Sidebar list of user's groups with search and quick actions.

**Features**:
- Search functionality
- Unread message badges
- Group avatars and member counts
- Create group button
- Group selection

**Props**:
```jsx
{
  groups: array,
  selectedGroupId: number,
  onSelectGroup: function,
  onCreateGroup: function,
  isLoading: boolean
}
```

---

### 6. GroupChat.jsx (Page Component)
**Purpose**: Main page component orchestrating the entire group chat interface.

**Features**:
- Loads user's groups on mount
- Manages WebSocket connection per group
- Handles message send/delete/receive
- Manages typing indicators
- Error handling and display

**State Management**:
```javascript
{
  groups: [],                    // User's groups
  selectedGroupId: null,         // Currently selected group
  messages: [],                  // Messages in selected group
  typingUsers: Set(),            // Users typing in current group
  isLoadingGroups: false,
  isLoadingMessages: false,
  isLoadingSend: false,
  error: null
}
```

---

## Services

### groupChatService.js
Central service for API communication.

**Methods**:

#### `getUserGroups()`
Fetches all groups for the current user.
```javascript
const response = await groupChatService.getUserGroups();
// Returns: { data: Array<Group> }
```

#### `getGroupMessages(groupId, limit?, offset?)`
Fetches messages for a specific group.
```javascript
const response = await groupChatService.getGroupMessages(groupId, 50, 0);
// Returns: { data: Array<Message> }
```

#### `sendMessage(groupId, content, file?)`
Sends a message to a group.
```javascript
const response = await groupChatService.sendMessage(groupId, "Hello!", null);
// Returns: { data: Message }
```

#### `deleteMessage(groupId, messageId)`
Deletes a message.
```javascript
await groupChatService.deleteMessage(groupId, messageId);
```

#### `editMessage(groupId, messageId, content)`
Edits a message.
```javascript
const response = await groupChatService.editMessage(groupId, messageId, "Edited text");
```

#### `reactToMessage(groupId, messageId, emoji)`
Adds emoji reaction to a message.
```javascript
await groupChatService.reactToMessage(groupId, messageId, "👍");
```

#### `leaveGroup(groupId)`
Leaves a group.
```javascript
await groupChatService.leaveGroup(groupId);
```

#### `markMessagesAsRead(groupId, messageIds)`
Marks messages as read.
```javascript
await groupChatService.markMessagesAsRead(groupId, [1, 2, 3]);
```

#### `searchMessages(groupId, query)`
Searches messages in a group.
```javascript
const response = await groupChatService.searchMessages(groupId, "searchterm");
```

---

### groupChatWebSocketManager.js
Handles WebSocket connections for real-time communication.

**Methods**:

#### `connect(groupId, userId, accessToken)`
Establishes WebSocket connection.
```javascript
wsManager.connect(groupId, userId, accessToken);
```

#### `send(message)`
Sends data through WebSocket.
```javascript
wsManager.send({
  type: 'typing_start'
});
```

#### `onMessage(handler)`
Register message listener.
```javascript
wsManager.onMessage((data) => {
  console.log('Received:', data);
});
```

#### `onConnectionChange(handler)`
Register connection status listener.
```javascript
wsManager.onConnectionChange((isConnected) => {
  console.log('Connected:', isConnected);
});
```

#### `onError(handler)`
Register error listener.
```javascript
wsManager.onError((error) => {
  console.error('Error:', error);
});
```

#### `disconnect()`
Closes WebSocket connection.
```javascript
wsManager.disconnect();
```

#### `isConnected()`
Checks connection status.
```javascript
const connected = wsManager.isConnected();
```

---

## WebSocket Message Types

### Incoming

#### `message`
New message received.
```json
{
  "type": "message",
  "message": {
    "id": 1,
    "content": "Hello",
    "sender": { "id": 1, "username": "John" },
    "createdAt": "2024-01-01T12:00:00Z"
  }
}
```

#### `message_deleted`
Message deleted.
```json
{
  "type": "message_deleted",
  "messageId": 1
}
```

#### `typing_start`
User started typing.
```json
{
  "type": "typing_start",
  "userId": 2
}
```

#### `typing_stop`
User stopped typing.
```json
{
  "type": "typing_stop",
  "userId": 2
}
```

#### `user_joined`
User joined the group.
```json
{
  "type": "user_joined",
  "userId": 2,
  "username": "Jane"
}
```

#### `user_left`
User left the group.
```json
{
  "type": "user_left",
  "userId": 2
}
```

### Outgoing

#### `typing_start`
Notify group that user started typing.
```javascript
wsManager.send({ type: 'typing_start' });
```

#### `typing_stop`
Notify group that user stopped typing.
```javascript
wsManager.send({ type: 'typing_stop' });
```

---

## Integration with App

### Route Setup
```jsx
import GroupChat from './pages/GroupChat';

// In App.jsx routes
<Route path="/chats" element={<GroupChat />} />
```

### Navigation Links
```jsx
// In sidebar or nav
<Link to="/chats">Chats</Link>
```

---

## Features

### Real-time Messaging
- Messages appear instantly for all group members
- WebSocket handles delivery
- Fallback to API if WebSocket fails

### Typing Indicators
- Users see who's typing
- Auto-debounced (3-second timeout)
- Animated dot animation

### Message Management
- Delete own messages
- Copy message content
- Edit messages (extensible)
- React with emojis (extensible)

### Group Management
- Leave groups
- View member counts
- Search messages
- Unread message tracking

### Error Handling
- Connection errors with retry logic
- User-friendly error messages
- Graceful fallbacks

---

## Styling

Uses Tailwind CSS for all components:
- Primary color: `blue-600` for sent messages
- Secondary color: `gray-200` for received messages
- Avatar backgrounds: Gradient blue/indigo

### Responsive
- Mobile: Single column (list + chat stacked)
- Tablet: Split view optimized
- Desktop: Full sidebar + chat

---

## Performance Considerations

1. **Message Virtualization**: For large message lists, consider implementing virtualization
2. **Image Optimization**: Profile pictures and group avatars are lazy-loaded
3. **WebSocket Reconnection**: Auto-reconnects up to 5 times with exponential backoff
4. **Debouncing**: Typing indicators use 3-second debounce to reduce noise

---

## Environment Variables

```
VITE_API_BASE_URL=http://localhost:8080/api
```

---

## Future Enhancements

1. **Message Search**: Full-text search in group messages
2. **Pinned Messages**: Pin important messages
3. **Message Reactions**: Emoji reactions on messages
4. **File Sharing**: Send files/images in messages
5. **Voice/Video**: Call functionality
6. **Message Threading**: Reply to specific messages
7. **Message Editing**: Edit sent messages
8. **Message Starring**: Star important messages
9. **User Mentions**: @user mentions with notifications
10. **Message Drafts**: Auto-save drafts locally

---

## Troubleshooting

### WebSocket Connection Fails
- Check network connectivity
- Verify JWT token validity
- Check server WebSocket configuration
- Check browser console for errors

### Messages Not Sending
- Check API response status
- Verify user authentication
- Check message content validation
- Look for network errors

### Typing Indicators Not Working
- Verify WebSocket connection
- Check debounce timing
- Verify server receives typing events

---

## Dependencies

- `lucide-react`: Icons
- `axios`: HTTP requests
- `react`: UI framework
- `react-router-dom`: Routing
- `tailwindcss`: Styling

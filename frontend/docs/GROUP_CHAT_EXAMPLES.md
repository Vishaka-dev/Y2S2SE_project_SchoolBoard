# Group Chat Implementation Examples

## Common Use Cases

### 1. Sending a Message

```jsx
import { useState } from 'react';
import groupChatService from '../../services/groupChatService';

function MessageSender({ groupId }) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await groupChatService.sendMessage(
        groupId,
        message.trim()
      );
      
      console.log('Message sent:', response.data);
      setMessage('');
      
    } catch (err) {
      setError('Failed to send message: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {error && <div className="text-red-600">{error}</div>}
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
      />
      <button
        onClick={handleSendMessage}
        disabled={isLoading || !message.trim()}
      >
        {isLoading ? 'Sending...' : 'Send'}
      </button>
    </div>
  );
}
```

### 2. Displaying Message History

```jsx
import { useEffect, useState } from 'react';
import groupChatService from '../../services/groupChatService';
import GroupMessageBubble from '../groupchat/GroupMessageBubble';

function MessageHistory({ groupId, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        setIsLoading(true);
        const response = await groupChatService.getGroupMessages(
          groupId,
          50,  // limit
          0    // offset
        );
        setMessages(response.data);
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [groupId]);

  if (isLoading) return <div>Loading messages...</div>;

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <GroupMessageBubble
          key={message.id}
          message={message}
          isOwn={message.senderId === currentUserId}
          currentUserId={currentUserId}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
```

### 3. Implementing Typing Indicators

```jsx
import { useRef, useState } from 'react';

function TypingIndicatorExample({ wsManager }) {
  const typingTimeoutRef = useRef(null);

  const handleInputChange = (e) => {
    const value = e.target.value;

    // Send typing start signal
    wsManager.send({ type: 'typing_start' });

    // Clear previous timeout
    clearTimeout(typingTimeoutRef.current);

    // Send typing stop after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      wsManager.send({ type: 'typing_stop' });
    }, 3000);
  };

  return (
    <textarea
      onChange={handleInputChange}
      placeholder="Start typing..."
    />
  );
}
```

### 4. WebSocket Connection Management

```jsx
import { useEffect, useState } from 'react';
import wsManager from '../../services/groupChatWebSocketManager';

function WebSocketExample({ groupId, userId, token }) {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Connect to WebSocket
    wsManager.connect(groupId, userId, token);

    // Register handlers
    const handleMessage = (data) => {
      console.log('Message received:', data);
      if (data.type === 'message') {
        setMessages(prev => [...prev, data.message]);
      }
    };

    const handleConnection = (connected) => {
      setIsConnected(connected);
      console.log('Connection status:', connected);
    };

    const handleError = (errorMsg) => {
      setError(errorMsg);
      console.error('WebSocket error:', errorMsg);
    };

    wsManager.onMessage(handleMessage);
    wsManager.onConnectionChange(handleConnection);
    wsManager.onError(handleError);

    // Cleanup
    return () => {
      wsManager.offMessage(handleMessage);
      wsManager.offConnectionChange(handleConnection);
      wsManager.offError(handleError);
      wsManager.disconnect();
    };
  }, [groupId, userId, token]);

  return (
    <div>
      <p>Status: {isConnected ? '✓ Connected' : '✗ Disconnected'}</p>
      {error && <p className="text-red-600">{error}</p>}
      <div className="space-y-2">
        {messages.map((msg, idx) => (
          <div key={idx} className="p-2 bg-gray-100 rounded">
            {msg.content}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 5. Pagination of Messages

```jsx
import { useState, useEffect } from 'react';
import groupChatService from '../../services/groupChatService';

function PaginatedMessages({ groupId }) {
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 50;

  const loadMoreMessages = async () => {
    try {
      const response = await groupChatService.getGroupMessages(
        groupId,
        pageSize,
        page * pageSize
      );

      if (response.data.length < pageSize) {
        setHasMore(false);
      }

      setMessages(prev => [...prev, ...response.data]);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Failed to load more messages:', error);
    }
  };

  useEffect(() => {
    loadMoreMessages();
  }, [groupId]);

  return (
    <div>
      <div className="space-y-2">
        {messages.map(msg => (
          <div key={msg.id} className="p-2 bg-gray-100">
            {msg.content}
          </div>
        ))}
      </div>
      {hasMore && (
        <button onClick={loadMoreMessages} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
          Load More
        </button>
      )}
    </div>
  );
}
```

### 6. Message Search

```jsx
import { useState } from 'react';
import groupChatService from '../../services/groupChatService';

function MessageSearch({ groupId }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const response = await groupChatService.searchMessages(groupId, query);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearch}
        placeholder="Search messages..."
        className="w-full px-4 py-2 border rounded"
      />
      
      {isSearching && <p>Searching...</p>}
      
      <div className="mt-4 space-y-2">
        {searchResults.map(msg => (
          <div key={msg.id} className="p-2 bg-yellow-50 border-l-4 border-yellow-400">
            <p className="font-semibold text-sm">{msg.sender?.username}</p>
            <p>{msg.content}</p>
            <p className="text-xs text-gray-500">
              {new Date(msg.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 7. Delete Message

```jsx
import { useState } from 'react';
import groupChatService from '../../services/groupChatService';

function DeleteMessage({ groupId, messageId, onDeleted }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);
      
      await groupChatService.deleteMessage(groupId, messageId);
      onDeleted?.(messageId);
      
    } catch (err) {
      setError('Failed to delete message');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="text-red-600 hover:text-red-700 text-sm"
      >
        {isDeleting ? 'Deleting...' : 'Delete'}
      </button>
    </div>
  );
}
```

### 8. Leave Group

```jsx
import { useState } from 'react';
import groupChatService from '../../services/groupChatService';

function LeaveGroupButton({ groupId, groupName, onLeft }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLeaveGroup = async () => {
    try {
      setIsLoading(true);
      await groupChatService.leaveGroup(groupId);
      onLeft?.(groupId);
    } catch (error) {
      console.error('Failed to leave group:', error);
      alert('Failed to leave group');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => setShowConfirm(true)}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Leave Group
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <h3 className="font-bold text-lg mb-2">Leave Group?</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to leave {groupName}?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLeaveGroup}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {isLoading ? 'Leaving...' : 'Leave'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

### 9. Message Reactions (Future Enhancement)

```jsx
import { useState } from 'react';
import groupChatService from '../../services/groupChatService';

function MessageReactions({ groupId, messageId, onReactionAdded }) {
  const [isAdding, setIsAdding] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const emojis = ['👍', '❤️', '😂', '😢', '🎉', '🔥'];

  const handleReact = async (emoji) => {
    try {
      setIsAdding(true);
      const response = await groupChatService.reactToMessage(
        groupId,
        messageId,
        emoji
      );
      onReactionAdded?.(response.data);
      setShowEmojiPicker(false);
    } catch (error) {
      console.error('Failed to add reaction:', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        className="text-gray-500 hover:text-gray-700"
      >
        😊
      </button>

      {showEmojiPicker && (
        <div className="absolute bottom-full left-0 bg-white border rounded-lg shadow-lg p-2 flex gap-1 mb-2">
          {emojis.map(emoji => (
            <button
              key={emoji}
              onClick={() => handleReact(emoji)}
              disabled={isAdding}
              className="text-xl hover:scale-125 transition disabled:opacity-50"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 10. Integration with Auth Context

```jsx
import { useAuth } from '../../context/AuthContext';
import groupChatService from '../../services/groupChatService';

function GroupChatWithAuth() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <div>Please login to access chat</div>;
  }

  // Use user.id for current user identification
  return (
    <div>
      <p>Logged in as: {user.username}</p>
      {/* Rest of component */}
    </div>
  );
}
```

## Advanced Patterns

### Real-time Notification Manager

```jsx
import { useCallback, useEffect, useState } from 'react';
import wsManager from '../../services/groupChatWebSocketManager';

function useGroupChatNotifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handleMessage = (data) => {
      if (data.type === 'message') {
        setNotifications(prev => [...prev, {
          id: Date.now(),
          type: 'new_message',
          sender: data.message.sender.username,
          preview: data.message.content.substring(0, 50)
        }]);
      }
    };

    wsManager.onMessage(handleMessage);

    return () => wsManager.offMessage(handleMessage);
  }, []);

  const clearNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return { notifications, clearNotification };
}
```

### Debounced Message Search

```jsx
import { useCallback, useState } from 'react';
import groupChatService from '../../services/groupChatService';

function useMessageSearch(groupId) {
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimer = useRef(null);

  const search = useCallback(async (query) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await groupChatService.searchMessages(groupId, query);
      setResults(response.data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  }, [groupId]);

  const debouncedSearch = useCallback((query) => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      search(query);
    }, 300);
  }, [search]);

  return { results, isSearching, search: debouncedSearch };
}
```

## Testing Examples

```jsx
// Mock service for testing
const mockGroupChatService = {
  getUserGroups: jest.fn().mockResolvedValue({
    data: [
      { groupId: 1, groupName: 'Test Group', memberCount: 5 }
    ]
  }),
  getGroupMessages: jest.fn().mockResolvedValue({
    data: [
      { id: 1, content: 'Test message', sender: { id: 1, username: 'User' } }
    ]
  }),
  sendMessage: jest.fn().mockResolvedValue({
    data: { id: 2, content: 'New message', sender: { id: 1 } }
  })
};

// Test component
describe('GroupChat', () => {
  it('loads groups on mount', async () => {
    render(<GroupChat />);
    await waitFor(() => {
      expect(mockGroupChatService.getUserGroups).toHaveBeenCalled();
    });
  });
});
```

---

These examples cover the most common use cases. For more advanced scenarios, refer to the main GROUP_CHAT_FRONTEND_GUIDE.md documentation.

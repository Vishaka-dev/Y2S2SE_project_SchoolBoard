# Group Chat Quick Reference

## 🚀 Quick Start (5 minutes)

### 1. Add Route
Edit `frontend/src/App.jsx`:
```jsx
import GroupChat from './pages/GroupChat';

<Route path="/chats" element={<GroupChat />} />
```

### 2. Add Navigation Link
```jsx
<Link to="/chats">Chats</Link>
```

### 3. Start App
```bash
npm run dev
# Navigate to http://localhost:5173/chats
```

---

## 📂 File Locations

### Components
| Component | Location | Purpose |
|-----------|----------|---------|
| GroupMessageBubble | `src/components/groupchat/GroupMessageBubble.jsx` | Display single message |
| GroupMessageInput | `src/components/groupchat/GroupMessageInput.jsx` | Message composition |
| GroupChatWindow | `src/components/groupchat/GroupChatWindow.jsx` | Chat display area |
| GroupTypingIndicator | `src/components/groupchat/GroupTypingIndicator.jsx` | Typing animation |
| GroupChatList | `src/components/groupchat/GroupChatList.jsx` | Group sidebar |
| GroupChat (Page) | `src/pages/GroupChat.jsx` | Main orchestrator |

### Services
| Service | Location | Purpose |
|---------|----------|---------|
| groupChatService | `src/services/groupChatService.js` | API calls |
| WebSocket Manager | `src/services/groupChatWebSocketManager.js` | Real-time connection |

### Documentation
| Doc | Location | For |
|-----|----------|-----|
| Implementation Summary | `docs/GROUP_CHAT_IMPLEMENTATION_SUMMARY.md` | Overview |
| Setup Guide | `docs/GROUP_CHAT_SETUP.md` | Integration |
| Component Guide | `docs/GROUP_CHAT_FRONTEND_GUIDE.md` | Detailed docs |
| Code Examples | `docs/GROUP_CHAT_EXAMPLES.md` | Usage patterns |
| Quick Reference | `docs/GROUP_CHAT_QUICK_REFERENCE.md` | This file |

---

## 🔧 API Methods

### Fetch Groups
```javascript
const response = await groupChatService.getUserGroups();
console.log(response.data);  // Array of groups
```

### Get Messages
```javascript
const response = await groupChatService.getGroupMessages(groupId, 50, 0);
console.log(response.data);  // Array of messages
```

### Send Message
```javascript
const response = await groupChatService.sendMessage(groupId, "Hello!");
console.log(response.data);  // Sent message
```

### Delete Message
```javascript
await groupChatService.deleteMessage(groupId, messageId);
```

### Leave Group
```javascript
await groupChatService.leaveGroup(groupId);
```

### Search Messages
```javascript
const response = await groupChatService.searchMessages(groupId, "search term");
```

---

## 🌐 WebSocket Usage

### Connect
```javascript
import wsManager from '../../services/groupChatWebSocketManager';

wsManager.connect(groupId, userId, accessToken);
```

### Listen for Messages
```javascript
wsManager.onMessage((data) => {
  if (data.type === 'message') {
    console.log('New message:', data.message);
  }
});
```

### Send Typing Indicator
```javascript
wsManager.send({ type: 'typing_start' });
wsManager.send({ type: 'typing_stop' });
```

### Check Connection
```javascript
if (wsManager.isConnected()) {
  console.log('Connected!');
}
```

### Disconnect
```javascript
wsManager.disconnect();
```

---

## 🎨 Component Props Reference

### GroupMessageBubble
```jsx
<GroupMessageBubble
  message={{
    id: 1,
    content: "Hello",
    sender: { id: 1, username: "John", profileImageUrl: null },
    createdAt: "2024-01-01T12:00:00Z"
  }}
  isOwn={true}
  currentUserId={1}
  onDelete={(messageId) => console.log('Delete:', messageId)}
/>
```

### GroupMessageInput
```jsx
<GroupMessageInput
  onSend={(message) => console.log('Send:', message)}
  onTyping={() => console.log('Typing')}
  disabled={false}
  isLoading={false}
/>
```

### GroupChatWindow
```jsx
<GroupChatWindow
  group={{
    id: 1,
    groupId: 1,
    groupName: "Class Chat",
    groupProfilePictureUrl: "/images/group1.jpg",
    memberCount: 5
  }}
  messages={[]}
  currentUserId={1}
  typingUsers={new Set([2, 3])}
  messagesEndRef={messagesEndRef}
  onDeleteMessage={(messageId) => {}}
  onLeaveGroup={(groupId) => {}}
/>
```

### GroupChatList
```jsx
<GroupChatList
  groups={[]}
  selectedGroupId={1}
  onSelectGroup={(groupId) => {}}
  onCreateGroup={() => {}}
  isLoading={false}
/>
```

---

## 🎯 Common Tasks

### Task: Display Recent Messages
```jsx
const [messages, setMessages] = useState([]);

useEffect(() => {
  const loadMessages = async () => {
    const response = await groupChatService.getGroupMessages(groupId);
    setMessages(response.data);
  };
  loadMessages();
}, [groupId]);

return (
  <div>
    {messages.map(msg => (
      <GroupMessageBubble key={msg.id} message={msg} {...props} />
    ))}
  </div>
);
```

### Task: Send Message
```jsx
const handleSend = async (content) => {
  try {
    const response = await groupChatService.sendMessage(groupId, content);
    setMessages(prev => [...prev, response.data]);
  } catch (error) {
    console.error('Failed to send:', error);
  }
};
```

### Task: Handle Typing
```jsx
const handleTyping = () => {
  wsManager.send({ type: 'typing_start' });
  
  // Auto-stop after 3 seconds
  setTimeout(() => {
    wsManager.send({ type: 'typing_stop' });
  }, 3000);
};
```

### Task: Real-time Updates
```jsx
useEffect(() => {
  wsManager.onMessage((data) => {
    if (data.type === 'message') {
      setMessages(prev => [...prev, data.message]);
    } else if (data.type === 'typing_start') {
      setTypingUsers(prev => new Set(prev).add(data.userId));
    }
  });
}, []);
```

---

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| WebSocket connection fails | Check token validity, verify endpoint URL |
| Messages not sending | Verify API response, check user auth |
| Typing indicator not working | Ensure WebSocket is connected |
| Styling looks wrong | Check Tailwind CSS is configured |
| No groups appearing | Verify user has groups, check API response |
| Profile images not showing | Check image URL format, verify upload path |

---

## 🔐 Environment Variables

```bash
# .env.local or .env
VITE_API_BASE_URL=http://localhost:8080/api
```

---

## 📦 Dependencies

All dependencies already in `package.json`:
- `react` - UI framework
- `react-router-dom` - Routing
- `axios` - HTTP client
- `lucide-react` - Icons
- `tailwindcss` - Styling

No additional installations needed!

---

## 🎨 Styling Customization

### Change Primary Color
Search & replace in component files:
```
blue-600 → purple-600
blue-50 → purple-50
blue-700 → purple-700
```

### Change Avatar Colors
In components:
```jsx
// From
className="bg-gradient-to-br from-blue-600 to-indigo-600"

// To
className="bg-gradient-to-br from-purple-600 to-pink-600"
```

### Adjust Message Width
In GroupChatWindow.jsx:
```jsx
// From
max-w-xs

// To
max-w-sm  // Wider
// or
max-w-lg  // Much wider
```

---

## ✅ Integration Verification

After integration, verify:
- [ ] Route appears in React DevTools
- [ ] Navigation link works
- [ ] Groups load on page open
- [ ] Can select different groups
- [ ] Can type and send messages
- [ ] Messages appear in real-time
- [ ] Typing indicator works
- [ ] Can delete own messages
- [ ] Can leave groups
- [ ] Responsive on mobile

---

## 🧪 Testing Checklist

- [ ] Login with test account
- [ ] Open /chats page
- [ ] Sidebar shows groups
- [ ] Search filters groups
- [ ] Select group shows messages
- [ ] Type and send message
- [ ] Message appears for you
- [ ] Open same group in another browser
- [ ] Message appears there too
- [ ] Start typing, see indicator
- [ ] Stop typing, indicator disappears
- [ ] Delete message removes it
- [ ] Leave group removes from list

---

## 📞 Need Help?

1. **Component not rendering?** → Check route is added
2. **No groups showing?** → Check API endpoint
3. **Messages not real-time?** → Check WebSocket
4. **Styling broken?** → Check Tailwind config
5. **Authentication issues?** → Check JWT token

See detailed documentation files for more help.

---

## 🚀 Next Steps

1. ✅ Read this quick reference
2. 👉 **Next**: Read GROUP_CHAT_SETUP.md
3. 👉 Then: Read GROUP_CHAT_FRONTEND_GUIDE.md
4. 👉 Finally: Integrate into your app

---

**Version**: 1.0  
**Updated**: 2024  
**Status**: Ready for Use

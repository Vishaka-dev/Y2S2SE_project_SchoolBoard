# Group Chat Integration Setup

## Overview
This guide explains how to integrate the group chat components into your existing SchoolBoard application.

## Step 1: Add Route to App.jsx

Open `frontend/src/App.jsx` and add the group chat route:

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GroupChat from './pages/GroupChat';
// ... other imports

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Existing routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Add this new route */}
        <Route path="/chats" element={<GroupChat />} />
        
        {/* Other routes */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

## Step 2: Add Navigation Link

Update your navigation component to include a link to the chats page:

```jsx
// In your navigation/sidebar component
import { MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Navbar() {
  return (
    <nav>
      {/* Other nav items */}
      <Link to="/chats" className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded">
        <MessageSquare className="w-5 h-5" />
        <span>Chats</span>
      </Link>
    </nav>
  );
}
```

## Step 3: Verify Environment Configuration

Ensure your `.env.local` or environment configuration has:

```
VITE_API_BASE_URL=http://localhost:8080/api
```

The app will fall back to this default if not set.

## Step 4: Install Dependencies (if needed)

All required dependencies should already be installed:

```bash
npm install   # In frontend directory
```

The group chat uses:
- `lucide-react` (icons) - already in project
- `axios` (HTTP) - already in project
- `react` - already in project
- `react-router-dom` - already in project

## Component Tree

```
App
└── GroupChat (page)
    ├── GroupChatList (sidebar)
    │   ├── Search input
    │   ├── Create group button
    │   └── Group items
    ├── GroupChatWindow (main area)
    │   ├── Chat header
    │   ├── Messages container
    │   │   ├── GroupMessageBubble (per message)
    │   │   └── GroupTypingIndicator
    │   └── Error alert
    └── GroupMessageInput (footer)
```

## API Endpoints Required

The backend must provide these endpoints:

### Group Management
- `GET /api/groups/my-groups` - Get user's groups
- `GET /api/groups/{id}` - Get group details
- `POST /api/groups/{id}/leave` - Leave group

### Messages
- `GET /api/groups/{id}/messages` - Get group messages
- `POST /api/groups/{id}/messages` - Send message
- `DELETE /api/groups/{id}/messages/{messageId}` - Delete message
- `PUT /api/groups/{id}/messages/{messageId}` - Edit message

### WebSocket
- `WS /api/ws/group/{id}` - WebSocket endpoint

## Authentication

The app expects JWT token in localStorage:

```javascript
// After login, store token
localStorage.setItem('access_token', jwtToken);
```

This token is automatically sent in all API requests and WebSocket connections.

## File Structure

After integration, your frontend structure will be:

```
frontend/
├── src/
│   ├── components/
│   │   ├── groupchat/
│   │   │   ├── GroupMessageBubble.jsx
│   │   │   ├── GroupMessageInput.jsx
│   │   │   ├── GroupChatWindow.jsx
│   │   │   ├── GroupChatList.jsx
│   │   │   └── GroupTypingIndicator.jsx
│   │   └── ... (other components)
│   ├── pages/
│   │   ├── GroupChat.jsx
│   │   └── ... (other pages)
│   ├── services/
│   │   ├── groupChatService.js
│   │   ├── groupChatWebSocketManager.js
│   │   └── ... (other services)
│   └── App.jsx
├── docs/
│   └── GROUP_CHAT_FRONTEND_GUIDE.md
└── ... (other config files)
```

## Testing the Integration

1. **Start the backend server**:
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

2. **Start the frontend dev server**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Navigate to chats**:
   - Open http://localhost:5173/chats
   - Login if required
   - Should see group list on left and empty chat on right

4. **Test sending message**:
   - Select a group
   - Type a message
   - Press Enter or click Send
   - Message should appear

5. **Test typing indicator**:
   - Open chat in two browser windows
   - Start typing in one
   - Should see "Someone is typing..." in the other

## Styling Customization

The components use Tailwind CSS classes. To customize:

1. **Colors**: Update color references (blue-600, gray-200, etc.)
2. **Spacing**: Modify padding/margin classes (p-4, mb-4, etc.)
3. **Fonts**: Change text-size classes (text-sm, text-lg, etc.)

Example: Change primary color from blue to purple:

```jsx
// In GroupMessageBubble.jsx
- className="bg-blue-600"
+ className="bg-purple-600"
```

## Error Handling

The app displays errors in red banner at top:

```jsx
{error && (
  <div className="bg-red-50 border-b border-red-200 p-4">
    <p className="text-red-700">{error}</p>
  </div>
)}
```

Common errors:
- "Failed to load groups" - API call failed
- "Failed to load messages" - Message fetch failed
- "Failed to send message" - Send failed
- "Connection error occurred" - WebSocket issue

## Performance Tips

1. **Message Pagination**: For large groups, implement pagination:
   ```javascript
   const limit = 50;  // Messages per load
   const offset = messages.length;
   ```

2. **Image Optimization**: Ensure profile images are optimized
   - Use WebP format where possible
   - Serve appropriate sizes

3. **WebSocket Cleanup**: Always disconnect on unmount:
   ```javascript
   useEffect(() => {
     return () => wsManager.disconnect();
   }, []);
   ```

## Debugging

Enable debug logs:

```javascript
// In GroupChat.jsx
console.log('Groups loaded:', groups);
console.log('WebSocket message:', data);
console.log('Message sent:', response.data);
```

Monitor WebSocket:
- Open DevTools Network tab
- Filter by WS
- Click on connection to see messages

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- IE11: Not supported (use polyfills if needed)

## Mobile Responsiveness

The layout is fully responsive:
- Mobile: Stack list below chat (or overlay)
- Tablet: Side-by-side with adjusted widths
- Desktop: Full layout with sidebar

Customize breakpoints in GroupChat.jsx:

```jsx
<div className="flex h-screen bg-white">
  {/* Use md: prefix for tablet breakpoint */}
  <div className="w-full md:w-80">  {/* Full on mobile, 80 units on tablet+ */}
    <GroupChatList {...props} />
  </div>
  {/* Chat area fills remaining space */}
</div>
```

## Next Steps

1. **Test full flow** with backend
2. **Customize styling** to match your design
3. **Add additional features** like message search
4. **Implement notifications** for new messages
5. **Add typing indicator sound** if desired

## Support

For issues or questions:
1. Check WebSocket connection in DevTools
2. Review console for error messages
3. Verify API endpoints are correct
4. Check JWT token is valid
5. See GROUP_CHAT_FRONTEND_GUIDE.md for detailed component docs

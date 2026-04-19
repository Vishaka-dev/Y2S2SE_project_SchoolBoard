import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import conversationAPI from '../api/conversationAPI';
import messageAPI from '../api/messageAPI';
import groupChatService from '../services/groupChatService';
import webSocketService from '../services/webSocketService';
import {
  ConversationList,
  ChatWindow,
  MessageInput,
  TypingIndicator
} from '../components/chat';
import GroupChatWindow from '../components/groupchat/GroupChatWindow';
import GroupMessageInput from '../components/groupchat/GroupMessageInput';
import { Search, Loader2 } from 'lucide-react';

/**
 * Messages Page Component
 * Unified messaging for both 1-to-1 chats and group chats
 * Displays combined chat list with both conversation types
 */
const Messages = () => {
  const { user } = useAuth();
  const location = useLocation();
  const selectedGroupIdFromNav = location.state?.selectedGroupId;
  
  // Combined chat list
  const [allChats, setAllChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1-to-1 chat states
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const messagesEndRef = useRef(null);

  // Group chat states
  const [groupMessages, setGroupMessages] = useState([]);
  const [groupTypingUsers, setGroupTypingUsers] = useState(new Set());
  const [groupConversationMap, setGroupConversationMap] = useState({});
  const groupMessagesEndRef = useRef(null);

  // Load all chats (1-to-1 + groups)
  const loadAllChats = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch 1-to-1 conversations
      const convData = await conversationAPI.fetchConversations(0, 50);
      const conversations = (convData.content || convData || []).map(conv => ({
        ...conv,
        type: 'conversation',
        displayName: conv.otherUser?.username,
      }));

      // Fetch group chats - handle errors gracefully
      let groups = [];
      try {
        const groupData = await groupChatService.getUserGroups();
        const groupsWithMessages = await Promise.all(
          (groupData.data || []).map(async (group) => {
            let lastMessagePreview = group.lastMessagePreview;
            
            // If no last message preview, fetch the latest message
            if (!lastMessagePreview) {
              try {
                const convResponse = await groupChatService.getOrCreateGroupConversation(group.id);
                const conversationId = convResponse.data?.id || convResponse.data?.conversationId;
                if (conversationId) {
                  const msgResponse = await groupChatService.getGroupMessages(conversationId, 0, 1);
                  const messages = msgResponse.data?.content || msgResponse.data || [];
                  if (messages.length > 0) {
                    lastMessagePreview = messages[messages.length - 1].content;
                  }
                }
              } catch (err) {
                console.warn('Failed to fetch last message for group:', group.id, err);
              }
            }
            
            return {
              ...group,
              type: 'group',
              displayName: group.name,
              lastMessagePreview
            };
          })
        );
        groups = groupsWithMessages;
      } catch (groupErr) {
        console.warn('Failed to load groups:', groupErr);
        // Continue with just conversations if groups fail
      }

      // Combine and sort by most recent
      const combined = [...conversations, ...groups].sort((a, b) => {
        const aTime = new Date(a.updatedAt || a.lastMessageTime || 0).getTime();
        const bTime = new Date(b.updatedAt || b.lastMessageTime || 0).getTime();
        return bTime - aTime;
      });

      setAllChats(combined);
      setError(null);
    } catch (err) {
      console.error('Failed to load chats:', err);
      setError('Failed to load chats');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (!user) return; // Don't load until user is authenticated

    const init = async () => {
      await loadAllChats();
      try {
        await webSocketService.connectWebSocket();
      } catch (err) {
        console.error('WebSocket connection failed:', err);
      }
    };

    init();

    return () => {
      webSocketService.disconnectWebSocket();
    };
  }, [loadAllChats, user]);

  // Auto-select group if navigated from group card
  useEffect(() => {
    console.log('Auto-select effect:', { selectedGroupIdFromNav, allChatsLength: allChats.length });
    if (selectedGroupIdFromNav && allChats.length > 0) {
      console.log('Looking for group with ID:', selectedGroupIdFromNav);
      console.log('Available groups:', allChats.filter(c => c.type === 'group').map(c => ({ id: c.id, name: c.displayName })));
      // Convert IDs to strings for comparison to handle both number and string IDs
      const selectedGroupIdStr = String(selectedGroupIdFromNav);
      const groupChat = allChats.find(chat => chat.type === 'group' && String(chat.id) === selectedGroupIdStr);
      console.log('Found group chat:', groupChat);
      if (groupChat) {
        console.log('Selecting group chat:', groupChat.displayName);
        setSelectedChat(groupChat);
      }
    }
  }, [selectedGroupIdFromNav, allChats]);

  // Load messages based on selected chat type
  useEffect(() => {
    if (!selectedChat) {
      setMessages([]);
      setGroupMessages([]);
      return;
    }

    const loadChatMessages = async () => {
      try {
        if (selectedChat.type === 'group') {
          // Load group messages
          const convResponse = await groupChatService.getOrCreateGroupConversation(selectedChat.id);
          const conversationId = convResponse.data?.id || convResponse.data?.conversationId;
          
          if (conversationId) {
            setGroupConversationMap(prev => ({ ...prev, [selectedChat.id]: conversationId }));
            const msgResponse = await groupChatService.getGroupMessages(conversationId, 0, 50);
            setGroupMessages((msgResponse.data?.content || msgResponse.data || []).reverse());
          }
        } else {
          // Load 1-to-1 messages
          const msgData = await messageAPI.fetchMessages(selectedChat.id, 0, 30);
          setMessages((msgData.content || msgData || []).reverse());
          // Mark as read
          conversationAPI.markConversationAsRead(selectedChat.id).catch(err => 
            console.error('Failed to mark as read:', err)
          );
        }
      } catch (err) {
        console.error('Failed to load messages:', err);
        setError('Failed to load messages');
      }
    };

    loadChatMessages();
  }, [selectedChat]);

  // Send 1-to-1 message
  const handleSendMessage = async (content = '', attachments = []) => {
    if (!selectedChat || selectedChat.type !== 'conversation' || (!content.trim() && attachments.length === 0)) return;

    try {
      setSending(true);
      const response = await messageAPI.sendMessage(selectedChat.id, content, attachments);
      setMessages(prev => [...prev, response]);
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Send group message
  const handleSendGroupMessage = async (content, attachments = []) => {
    if (!selectedChat || selectedChat.type !== 'group' || (!content.trim() && attachments.length === 0)) return;

    try {
      setSending(true);
      const conversationId = groupConversationMap[selectedChat.id];
      
      if (!conversationId) {
        console.error('GroupConversation ID not found for group:', selectedChat.id);
        setError('Group conversation not initialized. Please refresh and try again.');
        return;
      }

      console.log('Sending message to group conversation:', { conversationId, content, attachmentCount: attachments.length });
      const response = await groupChatService.sendMessage(conversationId, content, attachments);
      console.log('Message sent successfully:', response.data);
      setGroupMessages(prev => [...prev, response.data]);
      
      // Update chat list with the new last message preview
      setAllChats(prev => prev.map(chat => 
        chat.type === 'group' && chat.id === selectedChat.id
          ? { ...chat, lastMessagePreview: content || `${attachments.length} file${attachments.length !== 1 ? 's' : ''}` }
          : chat
      ));
    } catch (err) {
      console.error('Failed to send message:', err);
      // Log more details about the error
      if (err.response) {
        console.error('Error status:', err.response.status);
        console.error('Error data:', err.response.data);
      }
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Delete 1-to-1 message
  const handleDeleteMessage = async (messageId) => {
    try {
      await messageAPI.deleteMessage(messageId);
      setMessages(prev => prev.filter(m => m.id !== messageId));
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  // Delete group message
  const handleDeleteGroupMessage = async (messageId) => {
    try {
      await groupChatService.deleteMessage(messageId);
      setGroupMessages(prev => prev.filter(m => m.id !== messageId));
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  // Leave group
  const handleLeaveGroup = async (groupId) => {
    try {
      await groupChatService.leaveGroup(groupId);
      setAllChats(prev => prev.filter(chat => !(chat.type === 'group' && chat.id === groupId)));
      setSelectedChat(null);
    } catch (err) {
      console.error('Failed to leave group:', err);
      setError('Failed to leave group');
    }
  };

  // Delete 1-to-1 conversation
  const handleDeleteConversation = async (convId) => {
    try {
      await conversationAPI.deleteConversation(convId);
      setAllChats(prev => prev.filter(chat => !(chat.type === 'conversation' && chat.id === convId)));
      if (selectedChat?.id === convId) {
        setSelectedChat(null);
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  // Filter chats
  const filteredChats = allChats.filter(chat =>
    !searchQuery || 
    chat.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden h-[calc(100vh-8rem)] border border-gray-300">
      <div className="flex h-full overflow-hidden">
        {/* Chat List Sidebar */}
        <div className="w-80 flex flex-col border-r border-gray-200 bg-gray-50">
          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-20">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchQuery ? 'No chats found' : 'No conversations yet'}
              </div>
            ) : (
              filteredChats.map(chat => (
                <button
                  key={`${chat.type}-${chat.id}`}
                  onClick={() => setSelectedChat(chat)}
                  className={selectedChat?.id === chat.id && selectedChat?.type === chat.type ? 'w-full px-4 py-3 text-left transition border-b-2 border-gray-200 flex items-center gap-3 bg-blue-50 rounded-lg' : 'w-full px-4 py-3 text-left transition border-b-2 border-gray-200 flex items-center gap-3 hover:bg-gray-50 rounded-lg'}
                >
                  <div className="relative">
                    {/* Avatar - show profile photo if available */}
                    {chat.type === 'group' ? (
                      // Group avatar
                      chat.profilePhoto ? (
                        <img
                          src={chat.profilePhoto}
                          alt={chat.displayName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
                          {chat.displayName?.[0]?.toUpperCase() || '?'}
                        </div>
                      )
                    ) : (
                      // User avatar - show profile photo if available
                      chat.otherUser?.profileImageUrl ? (
                        <img
                          src={chat.otherUser.profileImageUrl}
                          alt={chat.displayName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
                          {chat.displayName?.[0]?.toUpperCase() || '?'}
                        </div>
                      )
                    )}
                    {(chat.unreadCount > 0 || chat.hasUnread) && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{chat.displayName}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {chat.lastMessagePreview || chat.description || '(No messages yet)'}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {error && (
            <div className="flex-shrink-0 bg-red-50 border-b border-red-200 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {!selectedChat ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <p>Select a chat to start messaging</p>
            </div>
          ) : selectedChat.type === 'group' ? (
            // Group Chat View
            <>
              <GroupChatWindow
                group={selectedChat}
                messages={groupMessages}
                currentUserId={user?.id}
                typingUsers={groupTypingUsers}
                messagesEndRef={groupMessagesEndRef}
                onDeleteMessage={handleDeleteGroupMessage}
                onLeaveGroup={handleLeaveGroup}
              />
              <div className="flex-shrink-0 border-t border-gray-200">
                <GroupMessageInput
                  onSend={handleSendGroupMessage}
                  isLoading={sending}
                />
              </div>
            </>
          ) : (
            // 1-to-1 Chat View
            <>
              <ChatWindow
                selectedChat={selectedChat}
                messages={messages}
                currentUserId={user?.id}
                typingUsers={typingUsers}
                messagesEndRef={messagesEndRef}
                usernames={{
                  [selectedChat?.user1?.id]: selectedChat?.user1?.username,
                  [selectedChat?.user2?.id]: selectedChat?.user2?.username
                }}
                onDeleteMessage={handleDeleteMessage}
                onDeleteConversation={handleDeleteConversation}
              />
              <div className="flex-shrink-0 border-t border-gray-200">
                <MessageInput
                  value=""
                  onChange={() => {}}
                  onSend={handleSendMessage}
                  sending={sending}
                  onTyping={() => {}}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;


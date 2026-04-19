import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import groupChatService from '../../services/groupChatService';
import GroupChatList from './GroupChatList';
import GroupChatWindow from './GroupChatWindow';
import GroupMessageInput from './GroupMessageInput';
import { AlertCircle, Loader2 } from 'lucide-react';

/**
 * GroupChat Page Component
 * Main component for managing group chat interface
 */
const GroupChat = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [conversationMap, setConversationMap] = useState({}); // Map groupId -> conversationId
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingSend, setIsLoadingSend] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Load user's groups
  const loadGroups = useCallback(async () => {
    try {
      setIsLoadingGroups(true);
      const response = await groupChatService.getUserGroups();
      if (response && response.data) {
        setGroups(response.data);
        // Auto-select first group
        if (response.data.length > 0 && !selectedGroupId) {
          setSelectedGroupId(response.data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load groups:', err);
      setError('Failed to load groups');
    } finally {
      setIsLoadingGroups(false);
    }
  }, [selectedGroupId]);

  // Get or create conversation for group, then load messages
  const loadMessages = useCallback(async () => {
    if (!selectedGroupId) return;

    try {
      setIsLoadingMessages(true);
      
      // First, get or create the group conversation
      const convResponse = await groupChatService.getOrCreateGroupConversation(selectedGroupId);
      const conversationId = convResponse.data.id;
      
      // Store the mapping
      setConversationMap(prev => ({
        ...prev,
        [selectedGroupId]: conversationId
      }));

      // Then get messages for the conversation
      const messagesResponse = await groupChatService.getGroupMessages(conversationId, 0, 50);
      
      // Handle both Page<T> and array responses
      const messageData = messagesResponse.data.content || messagesResponse.data;
      setMessages(Array.isArray(messageData) ? messageData : []);
    } catch (err) {
      console.error('Failed to load messages:', err);
      setError('Failed to load messages');
    } finally {
      setIsLoadingMessages(false);
    }
  }, [selectedGroupId]);

  // Initialize WebSocket
  const initializeWebSocket = useCallback(() => {
    if (!selectedGroupId || !user?.id) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/ws/group/${selectedGroupId}`;

    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected for group', selectedGroupId);
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'message') {
          // New message received
          setMessages(prev => [...prev, data.message]);
          scrollToBottom();
        } else if (data.type === 'message_deleted') {
          // Message deleted
          setMessages(prev =>
            prev.filter(msg => msg.id !== data.messageId)
          );
        } else if (data.type === 'typing_start') {
          // User started typing
          setTypingUsers(prev => new Set(prev).add(data.userId));
        } else if (data.type === 'typing_stop') {
          // User stopped typing
          setTypingUsers(prev => {
            const updated = new Set(prev);
            updated.delete(data.userId);
            return updated;
          });
        } else if (data.type === 'user_joined') {
          // User joined group
          setGroups(prevGroups =>
            prevGroups.map(g =>
              g.id === selectedGroupId
                ? { ...g, memberCount: (g.memberCount || 0) + 1 }
                : g
            )
          );
        } else if (data.type === 'user_left') {
          // User left group
          if (data.userId === user.id) {
            // Current user left
            setGroups(prevGroups =>
              prevGroups.filter(g => g.id !== selectedGroupId)
            );
            setSelectedGroupId(null);
            setMessages([]);
          } else {
            // Someone else left
            setGroups(prevGroups =>
              prevGroups.map(g =>
                g.id === selectedGroupId
                  ? { ...g, memberCount: Math.max(0, (g.memberCount || 1) - 1) }
                  : g
              )
            );
          }
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error occurred');
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
      };
    } catch (err) {
      console.error('Failed to connect WebSocket:', err);
      setError('Failed to connect to chat');
    }
  }, [selectedGroupId, user?.id]);

  // Send message
  const handleSendMessage = useCallback(async (content) => {
    if (!selectedGroupId || !content.trim()) return;

    const conversationId = conversationMap[selectedGroupId];
    if (!conversationId) {
      setError('Chat not ready. Please refresh.');
      return;
    }

    try {
      setIsLoadingSend(true);
      const response = await groupChatService.sendMessage(conversationId, content);

      if (response && response.data) {
        // Add message to list (WebSocket might also deliver it)
        setMessages(prev => [...prev, response.data]);
        scrollToBottom();
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message');
    } finally {
      setIsLoadingSend(false);
    }
  }, [selectedGroupId, conversationMap]);

  // Delete message
  const handleDeleteMessage = useCallback(async (messageId) => {
    try {
      await groupChatService.deleteMessage(messageId);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (err) {
      console.error('Failed to delete message:', err);
      setError('Failed to delete message');
    }
  }, []);

  // Leave group
  const handleLeaveGroup = useCallback(async (groupId) => {
    try {
      await groupChatService.leaveGroup(groupId);
      setGroups(prevGroups => prevGroups.filter(g => g.id !== groupId));
      if (selectedGroupId === groupId) {
        setSelectedGroupId(null);
        setMessages([]);
      }
    } catch (err) {
      console.error('Failed to leave group:', err);
      setError('Failed to leave group');
    }
  }, [selectedGroupId]);

  // Send typing indicator
  const sendTypingIndicator = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'typing_start'
      }));
    }
  }, []);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Load groups on mount
  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  // Load messages when group selected
  useEffect(() => {
    if (selectedGroupId) {
      loadMessages();
    }
  }, [selectedGroupId, loadMessages]);

  // Initialize WebSocket when group selected
  useEffect(() => {
    if (selectedGroupId) {
      initializeWebSocket();

      return () => {
        if (wsRef.current) {
          wsRef.current.close();
        }
      };
    }
  }, [selectedGroupId, initializeWebSocket]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const selectedGroup = groups.find(g => g.id === selectedGroupId);

  return (
    <div className="flex h-screen bg-white">
      {/* Groups List Sidebar */}
      <GroupChatList
        groups={groups}
        selectedGroupId={selectedGroupId}
        onSelectGroup={setSelectedGroupId}
        isLoading={isLoadingGroups}
      />

      {/* Chat Area */}
      <div className="flex-1 flex flex-col h-screen min-h-0 overflow-hidden">
        {/* Error Alert */}
        {error && (
          <div className="flex-shrink-0 bg-red-50 border-b border-red-200 p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}

        {/* Messages */}
        {isLoadingMessages ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            <GroupChatWindow
              group={selectedGroup}
              messages={messages}
              currentUserId={user?.id}
              typingUsers={typingUsers}
              messagesEndRef={messagesEndRef}
              onDeleteMessage={handleDeleteMessage}
              onLeaveGroup={handleLeaveGroup}
            />

            {/* Message Input */}
            {selectedGroup && (
              <GroupMessageInput
                onSend={handleSendMessage}
                onTyping={sendTypingIndicator}
                disabled={false}
                isLoading={isLoadingSend}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GroupChat;

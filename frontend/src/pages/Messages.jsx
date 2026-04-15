import { MessageSquare, Search, Send, Loader, AlertCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import conversationAPI from '../api/conversationAPI';
import messageAPI from '../api/messageAPI';
import webSocketService from '../services/webSocketService';

const Messages = () => {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  let unsubscribeConversation = null;
  let unsubscribeTyping = null;

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch conversations on mount
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const data = await conversationAPI.fetchConversations(0, 50);
        setConversations(data.content || data || []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch conversations:', err);
        setError('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    // Connect WebSocket
    const connectWS = async () => {
      try {
        await webSocketService.connectWebSocket();
      } catch (err) {
        console.error('WebSocket connection failed:', err);
      }
    };

    fetchConversations();
    connectWS();

    return () => {
      webSocketService.disconnectWebSocket();
    };
  }, []);

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (!selectedChat) {
      setMessages([]);
      if (unsubscribeConversation) unsubscribeConversation();
      if (unsubscribeTyping) unsubscribeTyping();
      return;
    }

    const fetchMessages = async () => {
      try {
        const data = await messageAPI.fetchMessages(selectedChat.id, 0, 30);
        // Reverse to show newest at bottom
        setMessages((data.content || data || []).reverse());
      } catch (err) {
        console.error('Failed to fetch messages:', err);
        setError('Failed to load messages');
      }
    };

    const handleNewMessage = (message) => {
      setMessages(prev => [...prev, message]);
    };

    const handleTypingIndicator = (data) => {
      if (data.isTyping && data.userId !== user?.id) {
        setTypingUsers(prev => new Set([...prev, data.userId]));
      } else if (!data.isTyping && data.userId !== user?.id) {
        setTypingUsers(prev => {
          const updated = new Set(prev);
          updated.delete(data.userId);
          return updated;
        });
      }
    };

    fetchMessages();
    
    // Subscribe to real-time messages
    if (webSocketService.isWebSocketConnected()) {
      unsubscribeConversation = webSocketService.subscribeToConversation(
        selectedChat.id,
        handleNewMessage
      );
      unsubscribeTyping = webSocketService.subscribeToTypingIndicators(
        selectedChat.id,
        handleTypingIndicator
      );
    }

    // Mark conversation as read
    conversationAPI.markConversationAsRead(selectedChat.id).catch(err => {
      console.error('Failed to mark conversation as read:', err);
    });

    return () => {
      if (unsubscribeConversation) unsubscribeConversation();
      if (unsubscribeTyping) unsubscribeTyping();
    };
  }, [selectedChat, user?.id]);

  // Handle typing indicator
  const handleInputChange = (e) => {
    setMessageInput(e.target.value);

    if (!isTyping && webSocketService.isWebSocketConnected()) {
      setIsTyping(true);
      webSocketService.sendTypingIndicator(selectedChat.id, true).catch(err => {
        console.error('Failed to send typing indicator:', err);
      });
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing after 1 second of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (webSocketService.isWebSocketConnected()) {
        webSocketService.sendTypingIndicator(selectedChat.id, false).catch(err => {
          console.error('Failed to stop typing indicator:', err);
        });
        setIsTyping(false);
      }
    }, 1000);
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedChat || sending) return;

    try {
      setSending(true);
      
      // Send via WebSocket for real-time broadcast
      if (webSocketService.isWebSocketConnected()) {
        await webSocketService.sendMessage(selectedChat.id, messageInput.trim());
      } else {
        // Fallback to REST API if WebSocket not available
        await messageAPI.sendMessage(selectedChat.id, messageInput.trim());
      }

      setMessageInput('');
      
      // Stop typing indicator
      if (webSocketService.isWebSocketConnected()) {
        await webSocketService.sendTypingIndicator(selectedChat.id, false);
        setIsTyping(false);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden h-[calc(100vh-8rem)]">
      <div className="flex h-full">
        {/* Conversations List */}
        <div className="w-80 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              Messages
            </h2>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search messages..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm transition"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader className="w-6 h-6 text-blue-600 animate-spin" />
              </div>
            ) : error ? (
              <div className="p-4 flex items-center gap-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p className="text-sm">No conversations yet</p>
              </div>
            ) : (
              conversations.map((conversation) => {
                const otherUser = conversation.user1?.id === user?.id ? conversation.user2 : conversation.user1;
                const unreadCount = conversation.unreadCount || 0;
                
                return (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedChat(conversation)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition ${
                      selectedChat?.id === conversation.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {otherUser?.profileImageUrl ? (
                          <img 
                            src={otherUser.profileImageUrl} 
                            alt={otherUser.username} 
                            className="w-full h-full rounded-full object-cover" 
                          />
                        ) : (
                          <span className="text-sm">{getInitials(otherUser?.username || 'User')}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-semibold text-gray-900 text-sm truncate">
                            {otherUser?.username || 'Unknown User'}
                          </h3>
                          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                            {new Date(conversation.lastMessage?.createdAt).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {conversation.lastMessage?.senderUsername === user?.username ? 'You: ' : ''}
                          {conversation.lastMessage?.content || 'No messages yet'}
                        </p>
                      </div>
                      {unreadCount > 0 && (
                        <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
                          {unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold">
                    {(() => {
                      const otherUser = selectedChat.user1?.id === user?.id ? selectedChat.user2 : selectedChat.user1;
                      return (
                        <img  
                          src={otherUser?.profileImageUrl} 
                          alt={otherUser?.username} 
                          className="w-full h-full rounded-full object-cover" 
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      );
                    })()}
                    <span className="text-sm hidden" style={{display: 'none'}}>
                      {getInitials(
                        selectedChat.user1?.id === user?.id 
                          ? selectedChat.user2?.username 
                          : selectedChat.user1?.username || 'User'
                      )}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {selectedChat.user1?.id === user?.id 
                        ? selectedChat.user2?.username 
                        : selectedChat.user1?.username}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {typingUsers.size > 0 ? 'Typing...' : 'Online'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <p className="text-sm">No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`rounded-2xl px-4 py-3 shadow-sm max-w-md ${
                            message.senderId === user?.id
                              ? 'bg-blue-600 text-white rounded-tr-sm'
                              : 'bg-white text-gray-800 rounded-tl-sm'
                          }`}
                        >
                          <p className="text-sm break-words">{message.content}</p>
                          <span
                            className={`text-xs mt-1 block ${
                              message.senderId === user?.id ? 'text-blue-100' : 'text-gray-500'
                            }`}
                          >
                            {new Date(message.createdAt).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                            {message.senderId === user?.id && message.isRead ? ' ✓✓' : ''}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={handleInputChange}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={sending || !messageInput.trim()}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import conversationAPI from '../api/conversationAPI';
import messageAPI from '../api/messageAPI';
import attachmentAPI from '../api/attachmentAPI';
import webSocketService from '../services/webSocketService';
import {
  ConversationList,
  ChatWindow,
  MessageInput,
  TypingIndicator
} from '../components/chat';

/**
 * Messages Page Component
 * Main page component for 1-to-1 messaging
 * Orchestrates conversation list, chat display, and message input
 * Manages WebSocket connections and real-time updates
 */
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
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  let unsubscribeConversation = null;
  let unsubscribeTyping = null;

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
  const handleSendMessage = async (attachments = []) => {
    if (!messageInput.trim() && attachments.length === 0) return;
    if (!selectedChat || sending) return;

    try {
      setSending(true);
      let messageId = null;
      
      // Send message via REST API to get the messageId for attachments
      const newMessage = await messageAPI.sendMessage(selectedChat.id, messageInput.trim());
      messageId = newMessage.id;
      
      // Add message to local state immediately
      setMessages(prev => [...prev, newMessage]);

      setMessageInput('');
      
      // Upload attachments if present
      if (attachments.length > 0 && messageId) {
        try {
          // Convert attachment objects to File objects for upload
          const filesToUpload = attachments.map(att => att.file);
          await attachmentAPI.uploadAttachments(messageId, filesToUpload);
          console.log('Attachments uploaded successfully');
        } catch (attachErr) {
          console.error('Failed to upload attachments:', attachErr);
          setError('Message sent but attachments failed to upload');
        }
      }
      
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
        {/* Conversations List Component */}
        <ConversationList
          conversations={conversations}
          selectedChat={selectedChat}
          onSelectChat={setSelectedChat}
          loading={loading}
          error={error}
          currentUserId={user?.id}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Window Component */}
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
          />

          {/* Message Input Component - Only show when chat is selected */}
          {selectedChat && (
            <MessageInput
              value={messageInput}
              onChange={setMessageInput}
              onSend={handleSendMessage}
              sending={sending}
              disabled={false}
              onTyping={handleInputChange}
              maxLength={5000}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;

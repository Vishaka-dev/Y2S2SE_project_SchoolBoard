import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();
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

  // Handle userId query parameter to auto-select conversation
  useEffect(() => {
    const targetUserId = searchParams.get('userId');
    console.log('[AutoSelect] userId param:', targetUserId, 'selectedChat:', selectedChat?.id, 'loading:', loading, 'user:', user?.id);
    
    if (!targetUserId || !user || selectedChat) {
      console.log('[AutoSelect] Early return - targetUserId:', !!targetUserId, 'user:', !!user, 'selectedChat:', !!selectedChat);
      return; // Don't run if already have selectedChat
    }

    const targetId = parseInt(targetUserId);
    
    // Look for existing conversation with the user
    const existingConversation = conversations.find(conv => {
      return conv.otherUser?.id === targetId;
    });

    if (existingConversation) {
      console.log('[AutoSelect] Found existing conversation:', existingConversation.id);
      setSelectedChat(existingConversation);
    } else if (!loading) {
      // Only create new conversation after initial conversations have loaded
      console.log('[AutoSelect] Creating new conversation with user:', targetId);
      conversationAPI.createOrGetConversation(targetId)
        .then(newConversation => {
          console.log('[AutoSelect] New conversation created:', newConversation);
          setSelectedChat(newConversation);
          // Refetch conversations to keep list in sync
          conversationAPI.fetchConversations(0, 50)
            .then(data => setConversations(data.content || data || []))
            .catch(err => console.error('Failed to refetch conversations:', err));
        })
        .catch(err => {
          console.error('[AutoSelect] Failed to create conversation:', err);
          setError('Failed to start conversation with this user');
        });
    } else {
      console.log('[AutoSelect] Still loading, waiting for conversations to load');
    }
  }, [searchParams, user, loading, selectedChat, conversations]);

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

  // Handle input value changes
  const handleInputChange = (value) => {
    setMessageInput(value);
  };

  // Handle typing indicator
  const handleTyping = () => {
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
    const trimmedContent = messageInput.trim();
    
    // Validation before setting sending state
    if (!trimmedContent && attachments.length === 0) {
      console.warn('⚠️ No content and no attachments');
      return;
    }
    
    if (!selectedChat) {
      console.error('❌ No chat selected');
      setError('No conversation selected');
      return;
    }
    
    if (sending) {
      console.warn('⚠️ Already sending, ignoring duplicate');
      return;
    }

    setSending(true);
    setError('');
    let messageId = null;
    
    try {
      // Determine content to send
      const contentToSend = trimmedContent || (attachments.length > 0 ? '📎 Attachment' : '');
      
      if (!contentToSend) {
        throw new Error('No content to send');
      }
      
      console.log('📨 Sending message:', {
        hasTextContent: !!trimmedContent,
        contentToSend,
        attachmentCount: attachments.length,
        conversationId: selectedChat.id
      });
      
      // Send message via REST API to get the messageId for attachments
      const newMessage = await messageAPI.sendMessage(selectedChat.id, contentToSend);
      messageId = newMessage.id;

      // Add message to local state immediately
      setMessages(prev => [...prev, newMessage]);
      setMessageInput('');
      
      // Upload attachments if present (don't block on this)
      if (attachments.length > 0 && messageId) {
        (async () => {
          try {
            console.log('📎 Starting attachment upload:', {
              messageId,
              attachmentCount: attachments.length
            });
            
            // Convert attachment objects to File objects for upload
            const filesToUpload = attachments.map(att => att.file);
            await attachmentAPI.uploadAttachments(messageId, filesToUpload);
            
            console.log('✅ Attachments uploaded successfully');
          } catch (attachErr) {
            console.error('❌ Attachment upload failed:', {
              messageId,
              status: attachErr.response?.status,
              statusText: attachErr.response?.statusText,
              error: attachErr.response?.data || attachErr.message
            });
            setError('Message sent but attachments failed to upload');
          }
        })();
      }

      // Stop typing indicator
      if (webSocketService.isWebSocketConnected()) {
        webSocketService.sendTypingIndicator(selectedChat.id, false).catch(err => {
          console.error('Failed to stop typing indicator:', err);
        });
        setIsTyping(false);
      }

      console.log('✅ Message sent successfully');
      setSending(false);
    } catch (err) {
      console.error('❌ Failed to send message:', err);
      setError('Failed to send message');
      setSending(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden h-[calc(100vh-8rem)] border border-gray-300">
      <div className="flex h-full overflow-hidden">
        {/* Conversations List Component */}
        <ConversationList
          conversations={conversations.filter((conv) =>
            !searchQuery || 
            conv.otherUser?.username?.toLowerCase().includes(searchQuery.toLowerCase())
          )}
          selectedChat={selectedChat}
          onSelectChat={setSelectedChat}
          loading={loading}
          error={error}
          currentUserId={user?.id}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onDeleteConversation={(convId) => {
            console.log('Attempting to delete conversation:', convId);
            conversationAPI.deleteConversation(convId)
              .then(() => {
                console.log('Conversation deleted successfully:', convId);
                setConversations(prev => prev.filter(c => c.id !== convId));
                if (selectedChat?.id === convId) {
                  setSelectedChat(null);
                }
              })
              .catch(err => {
                console.error('Failed to delete conversation:', err);
                console.error('Error status:', err.response?.status);
                console.error('Error message:', err.response?.data?.message);
                alert('Failed to delete conversation: ' + (err.response?.data?.message || err.message));
              });
          }}
        />

        {/* Chat Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Chat Window Component - Scrollable with fixed header */}
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
            onDeleteMessage={(messageId) => {
              messageAPI.deleteMessage(messageId)
                .then(() => {
                  setMessages(prev => prev.filter(m => m.id !== messageId));
                })
                .catch(err => console.error('Failed to delete message:', err));
            }}
            onDeleteConversation={(convId) => {
              console.log('Attempting to delete conversation:', convId);
              conversationAPI.deleteConversation(convId)
                .then(() => {
                  console.log('Conversation deleted successfully:', convId);
                  setConversations(prev => prev.filter(c => c.id !== convId));
                  if (selectedChat?.id === convId) {
                    setSelectedChat(null);
                  }
                })
                .catch(err => {
                  console.error('Failed to delete conversation:', err);
                  console.error('Error status:', err.response?.status);
                  console.error('Error message:', err.response?.data?.message);
                  alert('Failed to delete conversation: ' + (err.response?.data?.message || err.message));
                });
            }}
          />

          {/* Message Input Component - Fixed at bottom */}
          {selectedChat && (
            <div className="flex-shrink-0 border-t border-gray-200">
              <MessageInput
                value={messageInput}
                onChange={setMessageInput}
                onSend={handleSendMessage}
                sending={sending}
                disabled={false}
                onTyping={handleTyping}
                maxLength={5000}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;

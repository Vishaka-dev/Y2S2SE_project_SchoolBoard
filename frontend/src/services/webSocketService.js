import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

/**
 * WebSocket Service
 * Manages real-time communication using STOMP protocol over SockJS
 * Handles message broadcasting and typing indicators
 */

let stompClient = null;
let isConnected = false;
const subscriptions = new Map(); // Store active subscriptions for cleanup

/**
 * Initialize WebSocket connection
 * @param {Function} onConnect - Callback when connection established
 * @param {Function} onError - Callback on connection error
 * @returns {Promise} Resolves when connected
 */
export const connectWebSocket = (onConnect, onError) => {
  return new Promise((resolve, reject) => {
    try {
      // Get JWT token from localStorage
      const token = localStorage.getItem('token');
      
      const socket = new SockJS(
        (import.meta.env.VITE_WS_BASE_URL || 'http://localhost:8080') + '/ws'
      );
      
      stompClient = Stomp.over(socket);
      
      // Disable debug output (comment out for debugging)
      stompClient.debug = () => {};
      
      // Include Authorization header with JWT token
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      stompClient.connect(
        headers,
        (frame) => {
          console.log('WebSocket connected:', frame);
          isConnected = true;
          
          if (onConnect) {
            onConnect();
          }
          resolve();
        },
        (error) => {
          console.error('WebSocket connection error:', error);
          isConnected = false;
          
          if (onError) {
            onError(error);
          }
          reject(error);
        }
      );
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      reject(error);
    }
  });
};

/**
 * Disconnect WebSocket connection
 * Cleans up all active subscriptions
 * @returns {Promise} Resolves when disconnected
 */
export const disconnectWebSocket = () => {
  return new Promise((resolve) => {
    if (stompClient && isConnected) {
      // Unsubscribe from all active subscriptions
      subscriptions.forEach((subscription) => {
        subscription.unsubscribe();
      });
      subscriptions.clear();
      
      stompClient.disconnect(() => {
        console.log('WebSocket disconnected');
        isConnected = false;
        stompClient = null;
        resolve();
      });
    } else {
      resolve();
    }
  });
};

/**
 * Subscribe to conversation messages
 * Listens for new messages broadcast to a conversation
 * @param {number} conversationId - Conversation ID to subscribe to
 * @param {Function} onMessage - Callback when message received
 * @returns {Function} Unsubscribe function
 */
export const subscribeToConversation = (conversationId, onMessage) => {
  if (!isConnected || !stompClient) {
    console.warn('WebSocket not connected. Cannot subscribe to conversation.');
    return () => {};
  }
  
  const destination = `/topic/conversation/${conversationId}`;
  
  const subscription = stompClient.subscribe(destination, (message) => {
    try {
      const payload = JSON.parse(message.body);
      onMessage(payload);
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  });
  
  // Store subscription for cleanup on disconnect
  subscriptions.set(destination, subscription);
  
  console.log(`Subscribed to conversation ${conversationId}`);
  
  // Return unsubscribe function
  return () => {
    subscription.unsubscribe();
    subscriptions.delete(destination);
    console.log(`Unsubscribed from conversation ${conversationId}`);
  };
};

/**
 * Subscribe to user's typing indicators
 * Listens for typing events in a conversation
 * @param {number} conversationId - Conversation ID
 * @param {Function} onTyping - Callback when typing indicator received
 * @returns {Function} Unsubscribe function
 */
export const subscribeToTypingIndicators = (conversationId, onTyping) => {
  if (!isConnected || !stompClient) {
    console.warn('WebSocket not connected. Cannot subscribe to typing indicators.');
    return () => {};
  }
  
  const destination = `/topic/typing/${conversationId}`;
  
  const subscription = stompClient.subscribe(destination, (message) => {
    try {
      const payload = JSON.parse(message.body);
      onTyping(payload);
    } catch (error) {
      console.error('Failed to parse typing indicator:', error);
    }
  });
  
  subscriptions.set(destination, subscription);
  
  console.log(`Subscribed to typing indicators for conversation ${conversationId}`);
  
  return () => {
    subscription.unsubscribe();
    subscriptions.delete(destination);
    console.log(`Unsubscribed from typing indicators for conversation ${conversationId}`);
  };
};

/**
 * Subscribe to user's personal notifications
 * Used for receiving direct messages or notifications targeted to this user
 * @param {number} userId - Current user ID
 * @param {Function} onNotification - Callback when notification received
 * @returns {Function} Unsubscribe function
 */
export const subscribeToUserNotifications = (userId, onNotification) => {
  if (!isConnected || !stompClient) {
    console.warn('WebSocket not connected. Cannot subscribe to notifications.');
    return () => {};
  }
  
  const destination = `/user/${userId}/queue/notifications`;
  
  const subscription = stompClient.subscribe(destination, (message) => {
    try {
      const payload = JSON.parse(message.body);
      onNotification(payload);
    } catch (error) {
      console.error('Failed to parse notification:', error);
    }
  });
  
  subscriptions.set(destination, subscription);
  
  console.log(`Subscribed to notifications for user ${userId}`);
  
  return () => {
    subscription.unsubscribe();
    subscriptions.delete(destination);
    console.log(`Unsubscribed from notifications for user ${userId}`);
  };
};

/**
 * Send a message via WebSocket
 * Broadcasts message to all subscribers in conversation and persists to DB
 * @param {number} conversationId - Conversation ID
 * @param {string} content - Message content
 * @returns {Promise} Resolves when sent
 */
export const sendMessage = (conversationId, content) => {
  return new Promise((resolve, reject) => {
    if (!isConnected || !stompClient) {
      reject(new Error('WebSocket not connected'));
      return;
    }
    
    try {
      stompClient.send(
        '/app/chat.send',
        {},
        JSON.stringify({
          conversationId,
          content,
          timestamp: new Date().toISOString()
        }),
        (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        }
      );
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Send typing indicator
 * Notifies other users that current user is typing
 * @param {number} conversationId - Conversation ID
 * @param {boolean} isTyping - True if typing, false if stopped
 * @returns {Promise} Resolves when sent
 */
export const sendTypingIndicator = (conversationId, isTyping) => {
  return new Promise((resolve, reject) => {
    if (!isConnected || !stompClient) {
      reject(new Error('WebSocket not connected'));
      return;
    }
    
    try {
      stompClient.send(
        '/app/chat.typing',
        {},
        JSON.stringify({
          conversationId,
          isTyping,
          timestamp: new Date().toISOString()
        }),
        (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        }
      );
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Check if WebSocket is connected
 * @returns {boolean} Connection status
 */
export const isWebSocketConnected = () => {
  return isConnected && stompClient !== null;
};

/**
 * Subscribe to group chat messages
 * Listens for new messages broadcast to a group
 * @param {number} groupId - Group ID to subscribe to
 * @param {Function} onMessage - Callback when message received
 * @returns {Function} Unsubscribe function
 */
export const subscribeToGroupChat = (groupId, onMessage) => {
  if (!isConnected || !stompClient) {
    console.warn('WebSocket not connected. Cannot subscribe to group chat.');
    return () => {};
  }
  
  const destination = `/topic/group-chat.${groupId}`;
  
  const subscription = stompClient.subscribe(destination, (message) => {
    try {
      const payload = JSON.parse(message.body);
      onMessage(payload);
    } catch (error) {
      console.error('Failed to parse group message:', error);
    }
  });
  
  subscriptions.set(destination, subscription);
  
  console.log(`Subscribed to group chat ${groupId}`);
  
  return () => {
    subscription.unsubscribe();
    subscriptions.delete(destination);
    console.log(`Unsubscribed from group chat ${groupId}`);
  };
};

/**
 * Subscribe to group typing indicators
 * Listens for typing events in a group
 * @param {number} groupId - Group ID
 * @param {Function} onTyping - Callback when typing indicator received
 * @returns {Function} Unsubscribe function
 */
export const subscribeToGroupTyping = (groupId, onTyping) => {
  if (!isConnected || !stompClient) {
    console.warn('WebSocket not connected. Cannot subscribe to group typing indicators.');
    return () => {};
  }
  
  const destination = `/topic/group-chat.${groupId}.typing`;
  
  const subscription = stompClient.subscribe(destination, (message) => {
    try {
      const payload = JSON.parse(message.body);
      onTyping(payload);
    } catch (error) {
      console.error('Failed to parse group typing indicator:', error);
    }
  });
  
  subscriptions.set(destination, subscription);
  
  console.log(`Subscribed to group typing indicators for group ${groupId}`);
  
  return () => {
    subscription.unsubscribe();
    subscriptions.delete(destination);
    console.log(`Unsubscribed from group typing indicators for group ${groupId}`);
  };
};

/**
 * Send a group chat message via WebSocket
 * @param {number} groupId - Group ID
 * @param {number} senderId - Sender user ID
 * @param {string} content - Message content
 * @returns {Promise} Resolves when sent
 */
export const sendGroupMessage = (groupId, senderId, content) => {
  return new Promise((resolve, reject) => {
    if (!isConnected || !stompClient) {
      reject(new Error('WebSocket not connected'));
      return;
    }
    
    try {
      stompClient.send(
        '/app/group-chat.send',
        {},
        JSON.stringify({
          groupId,
          senderId,
          content,
          timestamp: new Date().toISOString()
        }),
        (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        }
      );
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Send typing indicator in group chat
 * @param {number} groupId - Group ID
 * @param {number} userId - User ID
 * @param {boolean} isTyping - True if typing, false if stopped
 * @returns {Promise} Resolves when sent
 */
export const sendGroupTypingIndicator = (groupId, userId, isTyping) => {
  return new Promise((resolve, reject) => {
    if (!isConnected || !stompClient) {
      reject(new Error('WebSocket not connected'));
      return;
    }
    
    try {
      stompClient.send(
        '/app/group-chat.typing',
        {},
        JSON.stringify({
          groupId,
          userId,
          isTyping,
          timestamp: new Date().toISOString()
        }),
        (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        }
      );
    } catch (error) {
      reject(error);
    }
  });
};

export default {
  connectWebSocket,
  disconnectWebSocket,
  subscribeToConversation,
  subscribeToTypingIndicators,
  subscribeToUserNotifications,
  subscribeToGroupChat,
  subscribeToGroupTyping,
  sendMessage,
  sendTypingIndicator,
  sendGroupMessage,
  sendGroupTypingIndicator,
  isWebSocketConnected
};

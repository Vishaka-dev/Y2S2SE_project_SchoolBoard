import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import conversationAPI from '../api/conversationAPI';
import groupChatService from '../services/groupChatService';
import { useAuth } from './AuthContext';

/**
 * Message Context
 * Manages global state for messaging, including unread counts
 * for both 1-to-1 conversations and group chats.
 */
const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasUnread, setHasUnread] = useState(false);
  const pollIntervalRef = useRef(null);

  const fetchUnreadCounts = useCallback(async () => {
    if (!user) return;
    
    try {
      // 1. Fetch unread count for 1-to-1 conversations
      let directUnreadCount = 0;
      try {
        const directData = await conversationAPI.getUnreadCount();
        directUnreadCount = directData.unreadCount || directData.totalUnreadCount || 0;
      } catch (err) {
        console.warn('Failed to fetch direct unread count:', err);
      }

      // 2. Fetch groups to check for unread symbols
      // Note: Backend might not have a global "group unread count" endpoint yet,
      // so we check the user's groups.
      let groupsHasUnread = false;
      try {
        const groupsResponse = await groupChatService.getUserGroups();
        const groups = groupsResponse.data || [];
        groupsHasUnread = groups.some(group => group.unreadCount > 0 || group.hasUnread);
      } catch (err) {
        console.warn('Failed to fetch groups for unread check:', err);
      }

      const totalUnread = directUnreadCount;
      setUnreadCount(totalUnread);
      setHasUnread(totalUnread > 0 || groupsHasUnread);
    } catch (error) {
      console.error('Error fetching unread message counts:', error);
    }
  }, [user]);

  // Initial fetch and polling
  useEffect(() => {
    if (user) {
      fetchUnreadCounts();
      
      // Poll every 30 seconds for new messages
      pollIntervalRef.current = setInterval(fetchUnreadCounts, 30000);
    } else {
      setUnreadCount(0);
      setHasUnread(false);
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [user, fetchUnreadCounts]);

  const refreshUnreadCount = () => {
    fetchUnreadCounts();
  };

  const value = {
    unreadCount,
    hasUnread,
    refreshUnreadCount
  };

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
};

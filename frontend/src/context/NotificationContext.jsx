import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import notificationService from '../services/notificationService';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const pollIntervalRef = useRef(null);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    
    try {
      // Current API doesn't have a dedicated count endpoint, 
      // so we fetch the first page and check unread notifications.
      // This is a common pattern for "activity dots".
      const data = await notificationService.getNotifications({ page: 0, size: 20 });
      const currentUnread = data.notifications?.filter(n => !n.isRead).length || 0;
      
      // If there are more than 20 notifications and the first 20 are all unread, 
      // there might be more, but for a "red dot" boolean indicator, > 0 is enough.
      setUnreadCount(currentUnread);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [user]);

  // Initial fetch and polling
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      
      // Poll every 30 seconds for new notifications
      pollIntervalRef.current = setInterval(fetchUnreadCount, 30000);
    } else {
      setUnreadCount(0);
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [user, fetchUnreadCount]);

  const refreshUnreadCount = () => {
    fetchUnreadCount();
  };

  const value = {
    unreadCount,
    hasUnread: unreadCount > 0,
    refreshUnreadCount
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

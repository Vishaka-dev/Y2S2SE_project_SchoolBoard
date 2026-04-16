import { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  BookOpenText,
  Calendar,
  Check,
  Heart,
  MessageSquare,
  ShieldCheck,
  UserCircle,
  UserPlus,
  Users,
} from 'lucide-react';
import notificationService from '../services/notificationService';

const PAGE_SIZE = 15;

const TYPE_META = {
  RESOURCE_UPLOADED: { Icon: BookOpenText, color: 'bg-blue-100 text-blue-600' },
  PROFILE_UPDATED: { Icon: UserCircle, color: 'bg-indigo-100 text-indigo-600' },
  PASSWORD_CHANGED: { Icon: ShieldCheck, color: 'bg-emerald-100 text-emerald-600' },
  GROUP_CREATED: { Icon: Users, color: 'bg-violet-100 text-violet-600' },
  MESSAGE_RECEIVED: { Icon: MessageSquare, color: 'bg-cyan-100 text-cyan-600' },
  EVENT_CREATED: { Icon: Calendar, color: 'bg-amber-100 text-amber-700' },
  USER_FOLLOWED: { Icon: UserPlus, color: 'bg-sky-100 text-sky-600' },
  POST_REACTED: { Icon: Heart, color: 'bg-rose-100 text-rose-600' },
};

const formatTimestamp = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState('');

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  );

  const loadNotifications = async ({ nextPage = 0, append = false } = {}) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setError('');
    }

    try {
      const data = await notificationService.getNotifications({ page: nextPage, size: PAGE_SIZE });
      const nextNotifications = Array.isArray(data?.notifications) ? data.notifications : [];

      setNotifications((previous) => (append ? [...previous, ...nextNotifications] : nextNotifications));
      setPage(data?.page ?? nextPage);
      setHasNext(Boolean(data?.hasNext));
    } catch (apiError) {
      setError(apiError?.message || 'Failed to load notifications');
      if (!append) {
        setNotifications([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      const updated = await notificationService.markAsRead(notificationId);
      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === notificationId ? { ...notification, ...updated, isRead: true } : notification
        )
      );
    } catch (apiError) {
      setError(apiError?.message || 'Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true);
    setError('');

    try {
      await notificationService.markAllAsRead();
      setNotifications((previous) => previous.map((notification) => ({ ...notification, isRead: true })));
    } catch (apiError) {
      setError(apiError?.message || 'Failed to mark all notifications as read');
    } finally {
      setMarkingAll(false);
    }
  };

  const handleLoadMore = async () => {
    if (!hasNext || loadingMore) {
      return;
    }
    await loadNotifications({ nextPage: page + 1, append: true });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Bell className="w-6 h-6 text-blue-600" />
              Notifications
            </h1>
            <p className="text-gray-600 text-sm mt-1">{unreadCount} unread notifications</p>
          </div>
          <button
            onClick={handleMarkAllAsRead}
            disabled={markingAll || unreadCount === 0}
            className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-xl text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {markingAll ? 'Marking...' : 'Mark all as read'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 text-center text-gray-500 text-sm">
          Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-10 border border-gray-100 text-center">
          <Bell className="w-10 h-10 mx-auto text-gray-300" />
          <p className="mt-3 text-sm text-gray-600">No notifications yet.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100 border border-gray-100">
            {notifications.map((notification) => {
              const meta = TYPE_META[notification.type] || {
                Icon: Bell,
                color: 'bg-gray-100 text-gray-600',
              };
              const Icon = meta.Icon;

              return (
                <div
                  key={notification.id}
                  className={`p-5 md:p-6 hover:bg-gray-50 transition ${
                    !notification.isRead ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <div className="flex gap-4">
                    <div
                      className={`w-11 h-11 rounded-xl ${meta.color} flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-semibold text-gray-900 text-sm md:text-base">
                          {notification.title}
                          {!notification.isRead && (
                            <span className="ml-2 w-2 h-2 bg-blue-600 rounded-full inline-block" />
                          )}
                        </h3>
                        <span className="text-xs text-gray-500 shrink-0">
                          {formatTimestamp(notification.createdAt)}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>

                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition"
                        >
                          <Check className="w-3 h-3" />
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {hasNext && (
            <div className="text-center py-2">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-6 py-2.5 text-blue-600 hover:bg-blue-50 rounded-xl font-medium text-sm transition disabled:opacity-50"
              >
                {loadingMore ? 'Loading...' : 'Load older notifications'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Notifications;

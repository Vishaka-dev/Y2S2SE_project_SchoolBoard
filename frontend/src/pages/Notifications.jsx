import { Bell, Check, X, UserPlus, MessageSquare, ThumbsUp, Calendar } from 'lucide-react';

const Notifications = () => {
  // Mock notifications - Replace with API calls
  const notifications = [
    {
      id: 1,
      type: 'connection',
      title: 'New Connection Request',
      message: 'Dr. Sarah Wilson wants to connect with you',
      time: '5 minutes ago',
      read: false,
      icon: UserPlus,
      color: 'blue'
    },
    {
      id: 2,
      type: 'message',
      title: 'New Message',
      message: 'Alex Chen sent you a message',
      time: '1 hour ago',
      read: false,
      icon: MessageSquare,
      color: 'green'
    },
    {
      id: 3,
      type: 'like',
      title: 'Post Like',
      message: 'Prof. James Brown liked your post',
      time: '3 hours ago',
      read: true,
      icon: ThumbsUp,
      color: 'purple'
    },
    {
      id: 4,
      type: 'event',
      title: 'Upcoming Event',
      message: 'Math Workshop starts in 2 days',
      time: '1 day ago',
      read: true,
      icon: Calendar,
      color: 'orange'
    },
  ];

  const getIconColor = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600',
    };
    return colors[color] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Bell className="w-6 h-6 text-blue-600" />
              Notifications
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              {notifications.filter(n => !n.read).length} unread notifications
            </p>
          </div>
          <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-xl text-sm font-medium transition">
            Mark all as read
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
        {notifications.map((notification) => {
          const Icon = notification.icon;
          return (
            <div
              key={notification.id}
              className={`p-6 hover:bg-gray-50 transition ${!notification.read ? 'bg-blue-50/30' : ''}`}
            >
              <div className="flex gap-4">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl ${getIconColor(notification.color)} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {notification.title}
                      {!notification.read && (
                        <span className="ml-2 w-2 h-2 bg-blue-600 rounded-full inline-block"></span>
                      )}
                    </h3>
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{notification.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{notification.message}</p>

                  {/* Action Buttons (for connection requests) */}
                  {notification.type === 'connection' && !notification.read && (
                    <div className="flex items-center gap-2 mt-3">
                      <button className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Accept
                      </button>
                      <button className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition flex items-center gap-1">
                        <X className="w-3 h-3" />
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More */}
      <div className="text-center py-4">
        <button className="px-6 py-3 text-blue-600 hover:bg-blue-50 rounded-xl font-medium transition">
          Load older notifications
        </button>
      </div>
    </div>
  );
};

export default Notifications;

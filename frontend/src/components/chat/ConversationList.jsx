import { Search, Loader, AlertCircle } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * ConversationList Component
 * Displays list of active conversations with last message preview
 * Features: Search, unread count badge, online status, avatar display
 */
const ConversationList = ({
  conversations,
  selectedChat,
  onSelectChat,
  loading,
  error,
  currentUserId,
  searchQuery,
  onSearchChange
}) => {
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-80 border-r border-gray-200 flex flex-col">
      {/* Header with Search */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Messages</h2>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search messages..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm transition"
          />
        </div>
      </div>

      {/* Conversations List */}
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
            const otherUser =
              conversation.user1?.id === currentUserId
                ? conversation.user2
                : conversation.user1;
            const unreadCount = conversation.unreadCount || 0;

            return (
              <div
                key={conversation.id}
                onClick={() => onSelectChat(conversation)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition ${
                  selectedChat?.id === conversation.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold flex-shrink-0 overflow-hidden">
                    {otherUser?.profileImageUrl ? (
                      <img
                        src={otherUser.profileImageUrl}
                        alt={otherUser.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm">
                        {getInitials(otherUser?.username || 'User')}
                      </span>
                    )}
                  </div>

                  {/* Conversation Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">
                        {otherUser?.username || 'Unknown User'}
                      </h3>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        {formatTime(conversation.lastMessage?.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.lastMessage?.senderUsername ===
                      currentUserId
                        ? 'You: '
                        : ''}
                      {conversation.lastMessage?.content || 'No messages yet'}
                    </p>
                  </div>

                  {/* Unread Badge */}
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
  );
};

ConversationList.propTypes = {
  conversations: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      user1: PropTypes.object,
      user2: PropTypes.object,
      lastMessage: PropTypes.object,
      unreadCount: PropTypes.number
    })
  ).isRequired,
  selectedChat: PropTypes.object,
  onSelectChat: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  currentUserId: PropTypes.number.isRequired,
  searchQuery: PropTypes.string,
  onSearchChange: PropTypes.func.isRequired
};

ConversationList.defaultProps = {
  selectedChat: null,
  error: null,
  searchQuery: ''
};

export default ConversationList;

import { MessageSquare } from 'lucide-react';
import PropTypes from 'prop-types';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

/**
 * ChatWindow Component
 * Displays active conversation with message history and typing indicators
 * Features: Auto-scroll, empty state, message display, typing indicators
 */
const ChatWindow = ({
  selectedChat,
  messages,
  currentUserId,
  typingUsers,
  messagesEndRef,
  usernames
}) => {
  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>Select a conversation to start messaging</p>
        </div>
      </div>
    );
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const otherUser =
    selectedChat.user1?.id === currentUserId
      ? selectedChat.user2
      : selectedChat.user1;

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold overflow-hidden">
            {otherUser?.profileImageUrl ? (
              <img
                src={otherUser.profileImageUrl}
                alt={otherUser?.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm">
                {getInitials(otherUser?.username || 'User')}
              </span>
            )}
          </div>

          {/* User Info */}
          <div>
            <h3 className="font-semibold text-gray-900">
              {otherUser?.username || 'Unknown User'}
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
              <p className="text-sm">
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={message.senderId === currentUserId}
                  currentUserId={currentUserId}
                  senderUsername={message.senderUsername}
                />
              ))}

              {/* Typing Indicator */}
              {typingUsers.size > 0 && (
                <TypingIndicator typingUsers={typingUsers} usernames={usernames} />
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
};

ChatWindow.propTypes = {
  selectedChat: PropTypes.object,
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      content: PropTypes.string.isRequired,
      senderId: PropTypes.number.isRequired,
      senderUsername: PropTypes.string,
      createdAt: PropTypes.string.isRequired,
      isRead: PropTypes.bool
    })
  ).isRequired,
  currentUserId: PropTypes.number.isRequired,
  typingUsers: PropTypes.instanceOf(Set).isRequired,
  messagesEndRef: PropTypes.object,
  usernames: PropTypes.object
};

ChatWindow.defaultProps = {
  selectedChat: null,
  messagesEndRef: null,
  usernames: {}
};

export default ChatWindow;

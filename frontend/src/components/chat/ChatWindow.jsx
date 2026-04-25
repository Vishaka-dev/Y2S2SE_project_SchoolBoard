import { MessageSquare, MoreVertical, Trash2 } from 'lucide-react';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  usernames,
  onDeleteMessage,
  onDeleteConversation
}) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteConversation = () => {
    setShowDeleteConfirm(true);
    setShowMenu(false);
  };

  const confirmDeleteConversation = () => {
    onDeleteConversation(selectedChat.id);
    setShowDeleteConfirm(false);
  };

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

  // Handle both ConversationDTO (with user1/user2) and ConversationListItemDTO (with otherUser)
  const otherUser = selectedChat.otherUser ||
    (selectedChat.user1?.id === currentUserId ? selectedChat.user2 : selectedChat.user1);

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden">
      {/* Chat Header - Fixed */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => otherUser?.id && navigate(`/profile/${otherUser.id}`)}>
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold overflow-hidden hover:opacity-80 transition">
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
              <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition">
                {otherUser?.username || 'Unknown User'}
              </h3>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-xs text-gray-500">
                  {typingUsers.size > 0 ? 'Typing...' : 'Online'}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Button */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              title="Conversation options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 top-10 bg-white rounded-lg shadow-lg border border-gray-200 z-50 w-48">
                <button
                  onClick={handleDeleteConversation}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Conversation
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <div className="space-y-2 pb-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p className="text-sm">
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            <>
              {messages.map((message) => {
                const senderId = message.sender?.id || message.senderId;
                return (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwn={senderId === currentUserId}
                    currentUserId={currentUserId}
                    senderUsername={message.senderUsername}
                    onDelete={onDeleteMessage}
                  />
                );
              })}

              {/* Typing Indicator */}
              {typingUsers.size > 0 && (
                <TypingIndicator typingUsers={typingUsers} usernames={usernames} />
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Delete Conversation Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-6 w-11/12 max-w-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Delete Conversation?</h3>
            <p className="text-gray-900 text-sm mb-6">This will permanently delete your conversation with {otherUser?.username}. This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteConversation}
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
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
  usernames: PropTypes.object,
  onDeleteMessage: PropTypes.func,
  onDeleteConversation: PropTypes.func
};

ChatWindow.defaultProps = {
  selectedChat: null,
  messagesEndRef: null,
  usernames: {}
};

export default ChatWindow;

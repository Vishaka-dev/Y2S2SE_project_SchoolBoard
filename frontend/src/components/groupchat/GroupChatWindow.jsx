import { MessageSquare, MoreVertical, LogOut } from 'lucide-react';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GroupMessageBubble from './GroupMessageBubble';
import GroupTypingIndicator from './GroupTypingIndicator';

/**
 * GroupChatWindow Component
 * Displays active group conversation with message history and typing indicators
 */
const GroupChatWindow = ({
  group,
  messages,
  currentUserId,
  typingUsers,
  messagesEndRef,
  onDeleteMessage,
  onLeaveGroup
}) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const handleLeaveGroup = () => {
    setShowLeaveConfirm(true);
    setShowMenu(false);
  };

  const confirmLeaveGroup = () => {
    onLeaveGroup(group.id);
    setShowLeaveConfirm(false);
  };

  if (!group) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>Select a chat to start messaging</p>
        </div>
      </div>
    );
  }

  const resolveImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const serverUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/api\/?$/, '');
    return `${serverUrl}${url.startsWith('/') ? url : `/${url}`}`;
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden">
      {/* Chat Header - Fixed */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Group Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold overflow-hidden">
              {group.groupProfilePictureUrl ? (
                <img
                  src={resolveImageUrl(group.groupProfilePictureUrl)}
                  alt={group.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm">{getInitials(group.name)}</span>
              )}
            </div>

            {/* Group Info */}
            <div>
              <h3 className="font-semibold text-gray-900">{group.name}</h3>
              <p className="text-xs text-gray-500">
                {group.memberCount || 0} members • {typingUsers.size > 0 ? 'Typing...' : 'Online'}
              </p>
            </div>
          </div>

          {/* Menu Button */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              title="Group options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 top-10 bg-white rounded-lg shadow-lg border border-gray-200 z-50 w-48">
                <button
                  onClick={() => {
                    navigate(`/groups/${group.id}`);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
                >
                  View Group Details
                </button>
                <button
                  onClick={handleLeaveGroup}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition"
                >
                  <LogOut className="w-4 h-4" />
                  Leave Group
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Leave Group Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm">
            <h3 className="font-bold text-gray-900 mb-2">Leave Group?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to leave {group.name}? You'll no longer have access to this group's chat.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmLeaveGroup}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}

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
                  <GroupMessageBubble
                    key={message.id}
                    message={message}
                    isOwn={senderId === currentUserId}
                    currentUserId={currentUserId}
                    onDelete={onDeleteMessage}
                  />
                );
              })}

              {/* Typing Indicator */}
              {typingUsers.size > 0 && (
                <GroupTypingIndicator typingUsers={typingUsers} />
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
};

GroupChatWindow.propTypes = {
  group: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    groupProfilePictureUrl: PropTypes.string,
    memberCount: PropTypes.number.isRequired
  }),
  messages: PropTypes.array.isRequired,
  currentUserId: PropTypes.number.isRequired,
  typingUsers: PropTypes.instanceOf(Set),
  messagesEndRef: PropTypes.object,
  onDeleteMessage: PropTypes.func.isRequired,
  onLeaveGroup: PropTypes.func.isRequired
};

GroupChatWindow.defaultProps = {
  typingUsers: new Set()
};

export default GroupChatWindow;

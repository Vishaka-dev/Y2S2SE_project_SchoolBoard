import { Trash2, Copy, Check } from 'lucide-react';
import PropTypes from 'prop-types';
import { useState } from 'react';

/**
 * GroupMessageBubble Component
 * Displays a single message in group chat with sender info and profile picture
 */
const GroupMessageBubble = ({ message, isOwn, currentUserId, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDelete = () => {
    onDelete(message.id);
    setShowMenu(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getInitials = (username) => {
    return username
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatTime = (dateTime) => {
    return new Date(dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isOwn) {
    // Own message - right aligned
    return (
      <div className="flex justify-end mb-4">
        <div className="flex gap-2 max-w-xs">
          <div className="flex flex-col items-end">
            <div className="group relative">
              <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none px-4 py-2 break-words">
                <p className="text-sm">{message.content}</p>
              </div>
              
              {/* Message Menu */}
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="invisible group-hover:visible absolute top-0 -right-8 p-1 text-gray-400 hover:text-gray-600 transition"
                title="Message options"
              >
                <span className="text-lg">⋮</span>
              </button>

              {showMenu && (
                <div className="absolute top-0 -right-32 bg-white rounded-lg shadow-lg border border-gray-200 z-50 w-40">
                  <button
                    onClick={handleCopy}
                    className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">{formatTime(message.createdAt)}</p>
          </div>
        </div>
      </div>
    );
  }

  // Other user's message - left aligned with profile pic
  return (
    <div className="flex gap-3 mb-4">
      {/* Profile Picture */}
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-xs overflow-hidden">
          {message.sender?.profileImageUrl ? (
            <img
              src={message.sender.profileImageUrl}
              alt={message.sender.username}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{getInitials(message.sender?.username || 'User')}</span>
          )}
        </div>
      </div>

      {/* Message Content */}
      <div className="flex flex-col">
        <p className="text-xs text-gray-500 font-semibold mb-0.5">
          {message.sender?.username || 'Unknown User'}
        </p>
        <div className="flex gap-2 items-start">
          <div className="bg-gray-200 text-gray-900 rounded-2xl rounded-tl-none px-4 py-2 break-words max-w-xs">
            <p className="text-sm">{message.content}</p>
          </div>
          <p className="text-xs text-gray-400 mt-1 whitespace-nowrap">
            {formatTime(message.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
};

GroupMessageBubble.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.number.isRequired,
    content: PropTypes.string.isRequired,
    sender: PropTypes.shape({
      id: PropTypes.number,
      username: PropTypes.string,
      profileImageUrl: PropTypes.string
    }),
    createdAt: PropTypes.string.isRequired
  }).isRequired,
  isOwn: PropTypes.bool.isRequired,
  currentUserId: PropTypes.number.isRequired,
  onDelete: PropTypes.func.isRequired
};

export default GroupMessageBubble;

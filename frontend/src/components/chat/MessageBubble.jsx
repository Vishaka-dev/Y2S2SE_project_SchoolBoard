import { useState } from 'react';
import PropTypes from 'prop-types';
import { MoreVertical, Trash2, Copy, Check } from 'lucide-react';
import AttachmentPreview from './AttachmentPreview';

/**
 * MessageBubble Component
 * Individual message display with sender styling
 * Features: Read receipts, timestamps, different styling for own/other messages, attachment display
 */
const MessageBubble = ({ message, isOwn, currentUserId, senderUsername, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get senderId from either sender object or direct field  
  const senderId = message.sender?.id || message.senderId;
  const isOwnMessage = senderId === currentUserId;

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowMenu(false);
      }, 1500);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  const handleDeleteMessage = () => {
    setShowDeleteConfirm(true);
    setShowMenu(false);
  };

  const confirmDelete = () => {
    onDelete(message.id);
    setShowDeleteConfirm(false);
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className="group flex flex-col gap-1 max-w-md">
        <div
          className={`relative rounded-2xl px-4 py-3 shadow-sm ${
            isOwnMessage
              ? 'bg-blue-600 text-white rounded-tr-sm'
              : 'bg-white text-gray-800 rounded-tl-sm'
          }`}
        >
          {/* Message Options Button - Inside bubble, top-right */}
          <div className="absolute top-2 right-2">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className={`p-1 rounded opacity-80 group-hover:opacity-100 transition ${
                isOwnMessage
                  ? 'text-blue-100 hover:text-white hover:bg-blue-500/20'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
              title="Message options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute top-8 right-0 bg-white rounded-lg shadow-lg border border-gray-200 z-50 w-40">
                {/* Copy Button */}
                <button
                  onClick={handleCopyMessage}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition first:rounded-t-lg"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-green-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>

                {/* Delete Button - Only for own messages */}
                {isOwnMessage && onDelete && (
                  <button
                    onClick={handleDeleteMessage}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition last:rounded-b-lg border-t border-gray-200"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Message Content */}
          <p className="text-sm break-words pr-8">{message.content}</p>

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {message.attachments.map((attachment) => (
                <AttachmentPreview
                  key={attachment.id}
                  attachment={attachment}
                  size="small"
                />
              ))}
            </div>
          )}

          {/* Timestamp & Read Receipt */}
          <span
            className={`text-xs mt-1 block ${
              isOwnMessage ? 'text-blue-100' : 'text-gray-500'
            }`}
          >
            {formatTime(message.createdAt)}
            {isOwnMessage && message.isRead && <span className="ml-1">✓✓</span>}
            {isOwnMessage && !message.isRead && <span className="ml-1">✓</span>}
          </span>
        </div>

        {/* Click outside to close menu */}
        {showMenu && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl p-6 w-11/12 max-w-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Delete Message?</h3>
              <p className="text-gray-900 text-sm mb-6">This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

MessageBubble.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.number.isRequired,
    content: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    isRead: PropTypes.bool,
    attachments: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        fileName: PropTypes.string,
        fileSize: PropTypes.number,
        fileType: PropTypes.string,
        downloadUrl: PropTypes.string
      })
    )
  }).isRequired,
  isOwn: PropTypes.bool.isRequired,
  currentUserId: PropTypes.number.isRequired,
  senderUsername: PropTypes.string,
  onDelete: PropTypes.func
};

MessageBubble.defaultProps = {
  senderUsername: 'Unknown'
};

export default MessageBubble;

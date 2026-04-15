import PropTypes from 'prop-types';
import AttachmentPreview from './AttachmentPreview';

/**
 * MessageBubble Component
 * Individual message display with sender styling
 * Features: Read receipts, timestamps, different styling for own/other messages, attachment display
 */
const MessageBubble = ({ message, isOwn, currentUserId, senderUsername }) => {
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`rounded-2xl px-4 py-3 shadow-sm max-w-md ${
          isOwn
            ? 'bg-blue-600 text-white rounded-tr-sm'
            : 'bg-white text-gray-800 rounded-tl-sm'
        }`}
      >
        {/* Message Content */}
        <p className="text-sm break-words">{message.content}</p>

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
            isOwn ? 'text-blue-100' : 'text-gray-500'
          }`}
        >
          {formatTime(message.createdAt)}
          {isOwn && message.isRead && <span className="ml-1">✓✓</span>}
          {isOwn && !message.isRead && <span className="ml-1">✓</span>}
        </span>
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
  senderUsername: PropTypes.string
};

MessageBubble.defaultProps = {
  senderUsername: 'Unknown'
};

export default MessageBubble;

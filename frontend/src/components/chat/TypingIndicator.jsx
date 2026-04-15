import PropTypes from 'prop-types';

/**
 * TypingIndicator Component
 * Shows animated typing indicator for users currently typing
 * Features: Animated dots, customizable styling, emoji support
 */
const TypingIndicator = ({ typingUsers, usernames }) => {
  if (typingUsers.size === 0) return null;

  const typingList = Array.from(typingUsers)
    .map(userId => usernames[userId] || `User ${userId}`)
    .join(', ');

  const typingText =
    typingUsers.size === 1 ? `${typingList} is typing` : `${typingList} are typing`;

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
        <span
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: '0.1s' }}
        ></span>
        <span
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: '0.2s' }}
        ></span>
      </div>
      <span>{typingText}...</span>
    </div>
  );
};

TypingIndicator.propTypes = {
  typingUsers: PropTypes.instanceOf(Set).isRequired,
  usernames: PropTypes.object
};

TypingIndicator.defaultProps = {
  usernames: {}
};

export default TypingIndicator;

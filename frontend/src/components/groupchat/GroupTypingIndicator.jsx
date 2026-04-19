import PropTypes from 'prop-types';

/**
 * GroupTypingIndicator Component
 * Shows which users are currently typing in the group
 */
const GroupTypingIndicator = ({ typingUsers }) => {
  if (!typingUsers || typingUsers.size === 0) {
    return null;
  }

  const userCount = typingUsers.size;
  const typingText = userCount === 1 ? 'Someone is' : `${userCount} people are`;

  return (
    <div className="flex gap-3 mb-4 px-4">
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>
        <p className="text-xs text-gray-500 italic">{typingText} typing...</p>
      </div>
    </div>
  );
};

GroupTypingIndicator.propTypes = {
  typingUsers: PropTypes.instanceOf(Set)
};

export default GroupTypingIndicator;

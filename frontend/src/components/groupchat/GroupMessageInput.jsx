import { Send, Paperclip, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * GroupMessageInput Component
 * Input field for composing and sending group messages
 */
const GroupMessageInput = ({ onSend, onTyping, disabled, isLoading }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const handleInputChange = (e) => {
    setMessage(e.target.value);

    // Typing indicator logic (debounced)
    if (!isTyping) {
      setIsTyping(true);
      onTyping?.(true);
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTyping?.(false);
    }, 3000);
  };

  const handleSend = () => {
    if (message.trim() && !isLoading && !disabled) {
      onSend?.(message.trim());
      setMessage('');
      setIsTyping(false);
      onTyping?.(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="flex gap-3">
        {/* File attachment button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isLoading}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
          title="Attach file"
        >
          <Paperclip className="w-5 h-5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          onChange={(e) => {
            // File upload logic can be added here
            console.log('File selected:', e.target.files[0]);
          }}
          className="hidden"
        />

        {/* Message input */}
        <textarea
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          disabled={disabled || isLoading}
          rows="1"
          className="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:opacity-50 transition"
          style={{ minHeight: '40px', maxHeight: '120px' }}
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!message.trim() || disabled || isLoading}
          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300 disabled:opacity-50"
          title="Send message"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
};

GroupMessageInput.propTypes = {
  onSend: PropTypes.func.isRequired,
  onTyping: PropTypes.func,
  disabled: PropTypes.bool,
  isLoading: PropTypes.bool
};

GroupMessageInput.defaultProps = {
  disabled: false,
  isLoading: false
};

export default GroupMessageInput;

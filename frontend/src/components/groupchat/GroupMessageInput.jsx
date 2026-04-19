import { Send, Paperclip, Loader2, X } from 'lucide-react';
import { useState, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * GroupMessageInput Component
 * Input field for composing and sending group messages with file attachments
 */
const GroupMessageInput = ({ onSend, onTyping, disabled, isLoading }) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
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

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const newAttachments = files.map((file, index) => ({
      id: `${file.name}-${Date.now()}-${index}`,
      file,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    }));
    
    setAttachments([...attachments, ...newAttachments]);
    e.target.value = ''; // Reset input
  };

  const removeAttachment = (id) => {
    setAttachments(attachments.filter(att => att.id !== id));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleSend = () => {
    if ((message.trim() || attachments.length > 0) && !isLoading && !disabled) {
      onSend?.(message.trim(), attachments);
      setMessage('');
      setAttachments([]);
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
      <div className="space-y-2">
        {/* Attachment Preview */}
        {attachments.length > 0 && (
          <div className="space-y-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">
                {attachments.length} file{attachments.length !== 1 ? 's' : ''} selected
              </p>
              <button
                onClick={() => setAttachments([])}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Clear
              </button>
            </div>
            <div className="space-y-2 max-h-24 overflow-y-auto">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between p-2 bg-white rounded border border-gray-200"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 truncate">
                      {att.fileName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(att.fileSize)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeAttachment(att.id)}
                    className="ml-2 text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
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
            onChange={handleFileSelect}
            multiple
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
            disabled={(!message.trim() && attachments.length === 0) || disabled || isLoading}
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

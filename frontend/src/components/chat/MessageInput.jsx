import { Send, Loader, Paperclip, X } from 'lucide-react';
import PropTypes from 'prop-types';
import { useState, useRef } from 'react';

/**
 * MessageInput Component
 * Text input field for sending messages with typing indicators and file attachments
 * Features: Character count, send button disable state, typing indicator management, file uploads
 */
const MessageInput = ({
  value,
  onChange,
  onSend,
  sending,
  disabled,
  onTyping,
  maxLength = 5000
}) => {
  const fileInputRef = useRef(null);
  const [attachments, setAttachments] = useState([]);
  const [showFileUpload, setShowFileUpload] = useState(false);

  const handleChange = (e) => {
    onChange(e.target.value);
    if (onTyping) {
      onTyping();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedValue = value.trim();
    
    // Prevent sending if no content and no attachments
    if (!trimmedValue && attachments.length === 0) {
      console.warn('⚠️ Prevented empty message submission');
      return;
    }
    
    // Prevent sending while already sending
    if (sending) {
      console.warn('⚠️ Already sending, ignoring duplicate submit');
      return;
    }
    
    console.log('✅ Form submitted with content:', { trimmedValue, attachmentCount: attachments.length });
    onSend(trimmedValue, attachments);
    setAttachments([]);
    setShowFileUpload(false);
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

  const characterCount = value.length;
  const isNearLimit = characterCount > maxLength * 0.9;

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
      <div className="space-y-2">
        {/* Character Counter */}
        {/* {characterCount > 0 && (
          <div
            className={`text-xs text-right ${
              isNearLimit ? 'text-orange-600 font-semibold' : 'text-gray-500'
            }`}
          >
            {characterCount} / {maxLength}
          </div>
        )} */}

        {/* Attachment Preview */}
        {attachments.length > 0 && (
          <div className="space-y-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">
                {attachments.length} file{attachments.length !== 1 ? 's' : ''} selected
              </p>
              <button
                type="button"
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
                    type="button"
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
          {/* File Upload Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || sending}
            className="px-3 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Attach file"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Message Input */}
          <input
            type="text"
            value={value}
            onChange={handleChange}
            placeholder="Type a message..."
            maxLength={maxLength}
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
            disabled={sending || disabled}
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={sending || (!value.trim() && attachments.length === 0) || disabled}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title={!value.trim() && attachments.length === 0 ? 'Type a message or add attachments' : 'Send message'}
          >
            {sending ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </>
            )}
          </button>
        </div>

        {/* Character Limit Warning */}
        {characterCount >= maxLength && (
          <div className="text-xs text-red-600">
            Message limit reached. Cannot add more characters.
          </div>
        )}
      </div>
    </form>
  );
};

MessageInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onSend: PropTypes.func.isRequired,
  sending: PropTypes.bool,
  disabled: PropTypes.bool,
  onTyping: PropTypes.func,
  maxLength: PropTypes.number
};

MessageInput.defaultProps = {
  sending: false,
  disabled: false,
  onTyping: null,
  maxLength: 5000
};

export default MessageInput;

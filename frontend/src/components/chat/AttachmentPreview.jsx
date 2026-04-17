import { File, FileText, Music, Download, Trash2, Image } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * AttachmentPreview Component
 * Displays individual attachment with file icon and download/delete options
 * Features: File type detection, download button, delete capability, file size display
 */
const AttachmentPreview = ({
  attachment,
  onDelete,
  isDeletable = false,
  size = 'normal'
}) => {
  const getFileIcon = (fileType, fileName) => {
    if (!fileType && !fileName) return <File className="w-4 h-4" />;
    
    const type = fileType?.toLowerCase() || '';
    
    if (type.startsWith('image/')) {
      return <Image className="w-4 h-4" />;
    }
    if (type.includes('pdf') || type.includes('document') || type.includes('word')) {
      return <FileText className="w-4 h-4" />;
    }
    if (type.includes('audio') || type.includes('mpeg') || type.includes('wav')) {
      return <Music className="w-4 h-4" />;
    }
    return <File className="w-4 h-4" />;
  };

  const truncateFileName = (name, maxLength = 20) => {
    if (!name || name.length <= maxLength) return name;
    const ext = name.substring(name.lastIndexOf('.'));
    const base = name.substring(0, maxLength - ext.length - 3);
    return `${base}...${ext}`;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (size === 'small') {
    // Compact view for message thread
    return (
      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200 max-w-xs">
        <div className="text-gray-500 flex-shrink-0">
          {getFileIcon(attachment.fileType, attachment.fileName)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-700 truncate">
            {truncateFileName(attachment.fileName)}
          </p>
          <p className="text-xs text-gray-500">
            {formatFileSize(attachment.fileSize)}
          </p>
        </div>
        <a
          href={attachment.downloadUrl}
          download
          className="text-blue-600 hover:text-blue-700 flex-shrink-0"
          title="Download file"
        >
          <Download className="w-4 h-4" />
        </a>
      </div>
    );
  }

  // Preview view for upload queue
  return (
    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="text-blue-600 flex-shrink-0">
          {getFileIcon(attachment.fileType, attachment.fileName)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {attachment.fileName}
          </p>
          <p className="text-xs text-gray-600">
            {formatFileSize(attachment.fileSize)}
          </p>
        </div>
      </div>

      {isDeletable && (
        <button
          onClick={() => onDelete(attachment.id || attachment.fileName)}
          className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded transition"
          title="Remove file"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      {attachment.downloadUrl && (
        <a
          href={attachment.downloadUrl}
          download
          className="ml-2 p-1 text-blue-600 hover:bg-blue-100 rounded transition"
          title="Download file"
        >
          <Download className="w-4 h-4" />
        </a>
      )}
    </div>
  );
};

AttachmentPreview.propTypes = {
  attachment: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    fileName: PropTypes.string.isRequired,
    fileSize: PropTypes.number.isRequired,
    fileType: PropTypes.string,
    downloadUrl: PropTypes.string
  }).isRequired,
  onDelete: PropTypes.func,
  isDeletable: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'normal'])
};

AttachmentPreview.defaultProps = {
  isDeletable: false,
  size: 'normal',
  onDelete: () => {}
};

export default AttachmentPreview;

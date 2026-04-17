import { Upload, X } from 'lucide-react';
import PropTypes from 'prop-types';
import { useRef, useState } from 'react';
import AttachmentPreview from './AttachmentPreview';

/**
 * FileUploadInput Component
 * Handles file selection and display for message attachments
 * Features: Drag-and-drop, file validation, preview, multi-file support
 */
const FileUploadInput = ({
  onFilesSelected,
  maxFiles = 5,
  maxFileSize = 5242880, // 5MB
  multiple = true
}) => {
  const fileInputRef = useRef(null);
  const dragCounter = useRef(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errors, setErrors] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const ALLOWED_TYPES = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'application/zip',
    'video/mp4',
    'audio/mpeg'
  ];

  const validateFiles = (files) => {
    const newErrors = [];
    const validFiles = [];

    Array.from(files).forEach((file, index) => {
      // Check file count
      if (selectedFiles.length + validFiles.length >= maxFiles) {
        newErrors.push(`Maximum ${maxFiles} files allowed`);
        return;
      }

      // Check file size
      if (file.size > maxFileSize) {
        newErrors.push(`${file.name}: File too large (max 50MB)`);
        return;
      }

      // Check file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        newErrors.push(`${file.name}: File type not allowed`);
        return;
      }

      validFiles.push({
        id: `${file.name}-${Date.now()}-${index}`,
        file: file,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });
    });

    return { validFiles, errors: newErrors };
  };

  const handleFileSelect = (files) => {
    const { validFiles, errors: newErrors } = validateFiles(files);
    
    if (newErrors.length > 0) {
      setErrors(newErrors.slice(0, 3)); // Show first 3 errors
    }

    if (validFiles.length > 0) {
      const updatedFiles = [...selectedFiles, ...validFiles];
      setSelectedFiles(updatedFiles);
      onFilesSelected(updatedFiles.map(f => f.file));
    }
  };

  const handleInputChange = (e) => {
    handleFileSelect(e.target.files);
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (dragCounter.current === 1) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (fileId) => {
    const updatedFiles = selectedFiles.filter(f => f.id !== fileId);
    setSelectedFiles(updatedFiles);
    onFilesSelected(updatedFiles.map(f => f.file));
  };

  const clearErrors = () => {
    setErrors([]);
  };

  if (selectedFiles.length === 0) {
    return (
      <div>
        {/* Drag and Drop Area */}
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-gray-50 hover:border-blue-400'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple={multiple}
            onChange={handleInputChange}
            accept={ALLOWED_TYPES.join(',')}
            className="hidden"
          />
          
          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm font-medium text-gray-900">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Max 50MB per file, up to {maxFiles} files
          </p>
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex justify-between items-start">
              <div className="text-sm text-red-700">
                {errors.map((error, idx) => (
                  <div key={idx}>• {error}</div>
                ))}
              </div>
              <button
                onClick={clearErrors}
                className="text-red-500 hover:text-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Show selected files
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-900">
          {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
        </p>
        {selectedFiles.length > 0 && (
          <button
            onClick={() => {
              setSelectedFiles([]);
              onFilesSelected([]);
              setErrors([]);
            }}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-2 max-h-40 overflow-y-auto">
        {selectedFiles.map((fileObj) => (
          <AttachmentPreview
            key={fileObj.id}
            attachment={fileObj}
            onDelete={() => removeFile(fileObj.id)}
            isDeletable={true}
            size="small"
          />
        ))}
      </div>

      {errors.length > 0 && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          {errors[0]}
        </div>
      )}
    </div>
  );
};

FileUploadInput.propTypes = {
  onFilesSelected: PropTypes.func.isRequired,
  maxFiles: PropTypes.number,
  maxFileSize: PropTypes.number,
  multiple: PropTypes.bool
};

FileUploadInput.defaultProps = {
  maxFiles: 5,
  maxFileSize: 5242880, // 5MB
  multiple: true
};

export default FileUploadInput;

package com.my_app.schoolboard.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

/**
 * FileUploadService
 * Handles file storage and management for  attachments
 * Features:
 * - Secure file storage with unique naming
 * - File size validation
 * - Supported file type validation
 * - File deletion and cleanup
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FileUploadService {
    
    @Value("${app.upload-dir:uploads/messages}")
    private String uploadDir;
    
    @Value("${app.max-file-size:5242880}")
    private long maxFileSize; // 5MB default
    
    // Allowed MIME types for attachments
    private static final String[] ALLOWED_TYPES = {
        "image/jpeg", "image/png", "image/gif", "image/webp",
        "application/pdf",
        "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "text/plain", "text/csv",
        "application/zip", "application/x-rar-compressed",
        "video/mp4", "video/quicktime", "audio/mpeg", "audio/wav"
    };
    
    /**
     * Save uploaded file to disk
     * @param file Multipart file to save
     * @return File metadata (path and download URL)
     * @throws IOException if file save fails
     * @throws IllegalArgumentException if file size or type invalid
     */
    public FileMetadata saveFile(MultipartFile file) throws IOException {
        // Validate file
        validateFile(file);
        
        // Create upload directory if not exists
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
            log.info("Created upload directory: {}", uploadDir);
        }
        
        // Generate unique filename
        String originalFileName = file.getOriginalFilename();
        String extension = getFileExtension(originalFileName);
        String uniqueFileName = UUID.randomUUID() + (extension.isEmpty() ? "" : "." + extension);
        
        // Save file
        Path filePath = uploadPath.resolve(uniqueFileName);
        Files.write(filePath, file.getBytes());
        
        log.info("File saved: {} (original: {})", uniqueFileName, originalFileName);
        
        // Return metadata
        return FileMetadata.builder()
            .fileName(originalFileName)
            .uniqueFileName(uniqueFileName)
            .filePath(filePath.toString())
            .fileSize(file.getSize())
            .fileType(file.getContentType())
            .downloadUrl("/api/attachments/download/" + uniqueFileName)
            .build();
    }
    
    /**
     * Delete file from disk
     * @param uniqueFileName Unique file identifier
     * @return true if deletion successful, false otherwise
     */
    public boolean deleteFile(String uniqueFileName) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(uniqueFileName);
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("File deleted: {}", uniqueFileName);
                return true;
            }
            log.warn("File not found for deletion: {}", uniqueFileName);
            return false;
        } catch (IOException e) {
            log.error("Error deleting file: {}", uniqueFileName, e);
            return false;
        }
    }
    
    /**
     * Get file from disk
     * @param uniqueFileName Unique file identifier
     * @return File bytes
     * @throws IOException if file not found or read fails
     */
    public byte[] getFile(String uniqueFileName) throws IOException {
        Path filePath = Paths.get(uploadDir).resolve(uniqueFileName);
        if (!Files.exists(filePath)) {
            throw new IOException("File not found: " + uniqueFileName);
        }
        return Files.readAllBytes(filePath);
    }
    
    /**
     * Validate file before upload
     * @param file File to validate
     * @throws IllegalArgumentException if validation fails
     */
    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        
        // Check file size
        if (file.getSize() > maxFileSize) {
            throw new IllegalArgumentException(
                String.format("File size exceeds maximum allowed size of %d bytes", maxFileSize)
            );
        }
        
        // Check file type
        String contentType = file.getContentType();
        if (contentType == null || !isAllowedType(contentType)) {
            throw new IllegalArgumentException(
                "File type not allowed: " + contentType
            );
        }
    }
    
    /**
     * Check if file type is allowed
     * @param contentType MIME type to check
     * @return true if allowed, false otherwise
     */
    private boolean isAllowedType(String contentType) {
        for (String allowedType : ALLOWED_TYPES) {
            if (contentType.equals(allowedType) || contentType.startsWith(allowedType.split("/")[0] + "/")) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Get file extension from filename
     * @param fileName File name
     * @return File extension or empty string
     */
    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
    }
    
    /**
     * FileMetadata DTO
     * Holds file metadata after upload
     */
    @lombok.Data
    @lombok.Builder
    public static class FileMetadata {
        private String fileName;           // Original filename
        private String uniqueFileName;     // Unique identifier
        private String filePath;           // Server-side path
        private Long fileSize;             // File size in bytes
        private String fileType;           // MIME type
        private String downloadUrl;        // Public download URL
    }
}

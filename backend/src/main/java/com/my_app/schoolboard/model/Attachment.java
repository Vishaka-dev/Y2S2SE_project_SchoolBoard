package com.my_app.schoolboard.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;

/**
 * Attachment Entity
 * Represents file attachments in messages
 * Features:
 * - File metadata storage (name, size, type, path)
 * - File size validation (max 5MB)
 * - Link to message and uploader
 * - Download URL generation
 * - Automatic timestamp tracking
 */
@Entity
@Table(name = "attachments", indexes = {
    @Index(name = "idx_attachments_message_id", columnList = "message_id"),
    @Index(name = "idx_attachments_uploaded_by", columnList = "uploaded_by"),
    @Index(name = "idx_attachments_created_at", columnList = "created_at DESC")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attachment {
    
    private static final Logger logger = LoggerFactory.getLogger(Attachment.class);
    private static final long MAX_FILE_SIZE = 5242880; // 5MB in bytes
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "message_id", nullable = false)
    private Message message;
    
    @Column(nullable = false, length = 255)
    private String fileName;
    
    @Column(nullable = false)
    private Long fileSize;
    
    @Column(length = 100)
    private String fileType; // MIME type (e.g., application/pdf, image/png)
    
    @Column(nullable = false, length = 500)
    private String filePath; // Server-side path
    
    @Column(length = 500)
    private String downloadUrl; // Public download URL
    
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "uploaded_by", nullable = false)
    private User uploadedBy;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    /**
     * Validate file size constraint (max 5MB)
     */
    @PrePersist
    @PreUpdate
    public void validateFileSize() {
        if (fileSize <= 0 || fileSize > MAX_FILE_SIZE) {
            throw new IllegalArgumentException(
                "File size must be between 1 byte and 5MB. Current: " + fileSize
            );
        }
    }
    
    /**
     * Get file extension from file name
     * @return file extension or empty string
     */
    public String getFileExtension() {
        if (fileName == null || !fileName.contains(".")) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
    }
    
    /**
     * Check if attachment is an image
     * @return true if file type is image/*
     */
    public boolean isImage() {
        return fileType != null && fileType.startsWith("image/");
    }
    
    /**
     * Check if attachment is a document
     * @return true if file type is application/pdf or application/msword, etc.
     */
    public boolean isDocument() {
        if (fileType == null) return false;
        return fileType.contains("pdf") || 
               fileType.contains("word") || 
               fileType.contains("document") ||
               fileType.contains("spreadsheet") ||
               fileType.contains("presentation");
    }
    
    /**
     * Format file size for display (B, KB, MB)
     * @return human-readable file size
     */
    public String getFormattedFileSize() {
        if (fileSize <= 0) return "0 B";
        final String[] units = new String[]{"B", "KB", "MB", "GB"};
        int unitIndex = (int) (Math.log10(fileSize) / Math.log10(1024));
        double size = fileSize / Math.pow(1024, unitIndex);
        return String.format("%.1f %s", size, units[unitIndex]);
    }
}

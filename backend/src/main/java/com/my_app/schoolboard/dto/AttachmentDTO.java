package com.my_app.schoolboard.dto;

import java.time.LocalDateTime;

/**
 * AttachmentDTO
 * Data Transfer Object for file attachments in API responses
 */
public class AttachmentDTO {
    private Long id;
    private String fileName;
    private Long fileSize;
    private String fileType;
    private String downloadUrl;
    private String formattedFileSize;
    private String fileExtension;
    private boolean isImage;
    private Long uploadedById;
    private String uploadedByUsername;
    private LocalDateTime createdAt;

    // Constructors
    public AttachmentDTO() {}

    public AttachmentDTO(Long id, String fileName, Long fileSize, String fileType, 
                       String downloadUrl, Long uploadedById, LocalDateTime createdAt) {
        this.id = id;
        this.fileName = fileName;
        this.fileSize = fileSize;
        this.fileType = fileType;
        this.downloadUrl = downloadUrl;
        this.uploadedById = uploadedById;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public String getDownloadUrl() {
        return downloadUrl;
    }

    public void setDownloadUrl(String downloadUrl) {
        this.downloadUrl = downloadUrl;
    }

    public String getFormattedFileSize() {
        if (fileSize <= 0) return "0 B";
        final String[] units = new String[]{"B", "KB", "MB", "GB"};
        int unitIndex = (int) (Math.log10(fileSize) / Math.log10(1024));
        double size = fileSize / Math.pow(1024, unitIndex);
        return String.format("%.1f %s", size, units[unitIndex]);
    }

    public void setFormattedFileSize(String formattedFileSize) {
        this.formattedFileSize = formattedFileSize;
    }

    public String getFileExtension() {
        if (fileName == null || !fileName.contains(".")) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
    }

    public void setFileExtension(String fileExtension) {
        this.fileExtension = fileExtension;
    }

    public boolean isImage() {
        return fileType != null && fileType.startsWith("image/");
    }

    public void setImage(boolean image) {
        isImage = image;
    }

    public Long getUploadedById() {
        return uploadedById;
    }

    public void setUploadedById(Long uploadedById) {
        this.uploadedById = uploadedById;
    }

    public String getUploadedByUsername() {
        return uploadedByUsername;
    }

    public void setUploadedByUsername(String uploadedByUsername) {
        this.uploadedByUsername = uploadedByUsername;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    /**
     * Static factory method to convert from entity
     */
    public static AttachmentDTO fromAttachment(com.my_app.schoolboard.model.Attachment attachment) {
        AttachmentDTO dto = new AttachmentDTO();
        dto.setId(attachment.getId());
        dto.setFileName(attachment.getFileName());
        dto.setFileSize(attachment.getFileSize());
        dto.setFileType(attachment.getFileType());
        dto.setDownloadUrl(attachment.getDownloadUrl());
        dto.setUploadedById(attachment.getUploadedBy().getId());
        dto.setUploadedByUsername(attachment.getUploadedBy().getUsername());
        dto.setCreatedAt(attachment.getCreatedAt());
        dto.setFileExtension(attachment.getFileExtension());
        dto.setImage(attachment.isImage());
        return dto;
    }
}

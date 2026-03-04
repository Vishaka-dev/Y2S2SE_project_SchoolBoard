package com.my_app.schoolboard.service;

import org.springframework.web.multipart.MultipartFile;

/**
 * Service interface for file storage operations
 * Abstraction allows easy switching between local storage and cloud providers
 * (AWS S3, Cloudinary, etc.)
 */
public interface FileStorageService {

    /**
     * Upload a profile image for a user
     * 
     * @param userId ID of the user uploading the image
     * @param file   MultipartFile to upload
     * @return Public URL of the uploaded file
     */
    String uploadProfileImage(Long userId, MultipartFile file);

    /**
     * Delete a file from storage
     * 
     * @param fileUrl URL or filename of the file to delete
     */
    void deleteFile(String fileUrl);

    /**
     * Initialize storage location
     * Creates necessary directories if they don't exist
     */
    void init();
}

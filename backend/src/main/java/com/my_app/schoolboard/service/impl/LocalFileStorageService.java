package com.my_app.schoolboard.service.impl;

import com.my_app.schoolboard.exception.FileStorageException;
import com.my_app.schoolboard.exception.InvalidFileException;
import com.my_app.schoolboard.service.FileStorageService;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;

/**
 * Local file system implementation of FileStorageService
 * Stores profile images in local directory: uploads/profile-images/
 * Can be replaced with cloud storage (AWS S3, Cloudinary, etc.) without
 * changing controller logic
 */
@Service
@Slf4j
public class LocalFileStorageService implements FileStorageService {

    private final Path profileImagesLocation;
    private final String baseUrl;

    // Allowed content types for profile images
    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "image/jpeg",
            "image/jpg",
            "image/png");

    // Maximum file size: 5MB
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

    public LocalFileStorageService(
            @Value("${file.profile-image-dir:uploads/profile-images}") String uploadDir,
            @Value("${app.base-url:http://localhost:8080}") String baseUrl) {
        this.profileImagesLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.baseUrl = baseUrl;
    }

    @PostConstruct
    @Override
    public void init() {
        try {
            Files.createDirectories(this.profileImagesLocation);
            log.info("Profile images directory initialized at: {}", this.profileImagesLocation);
        } catch (IOException e) {
            throw new FileStorageException("Could not create profile images directory", e);
        }
    }

    @Override
    public String uploadProfileImage(Long userId, MultipartFile file) {
        log.info("Uploading profile image for user ID: {}", userId);

        // Validate file
        validateFile(file);

        try {
            // Generate unique filename: profile_<userId>_<timestamp>.ext
            String originalFilename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
            String fileExtension = getFileExtension(originalFilename);
            String newFilename = String.format("profile_%d_%d%s", userId, System.currentTimeMillis(), fileExtension);

            // Resolve target location
            Path targetLocation = this.profileImagesLocation.resolve(newFilename);

            // Security check: ensure file is stored within designated directory
            if (!targetLocation.getParent().equals(this.profileImagesLocation)) {
                throw new FileStorageException("Cannot store file outside designated directory");
            }

            // Copy file to target location
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            }

            // Generate public URL
            String fileUrl = String.format("%s/uploads/profile-images/%s", baseUrl, newFilename);

            log.info("Profile image uploaded successfully: {}", fileUrl);
            return fileUrl;

        } catch (IOException e) {
            log.error("Failed to upload profile image for user ID: {}", userId, e);
            throw new FileStorageException("Failed to store profile image", e);
        }
    }

    @Override
    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return;
        }

        try {
            // Extract filename from URL
            // URL format: http://localhost:8080/uploads/profile-images/profile_1_12345.jpg
            String filename = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);

            Path filePath = this.profileImagesLocation.resolve(filename).normalize();

            // Security check: ensure file is within designated directory
            if (!filePath.getParent().equals(this.profileImagesLocation)) {
                throw new FileStorageException("Cannot delete file outside designated directory");
            }

            Files.deleteIfExists(filePath);
            log.info("Deleted profile image: {}", filename);

        } catch (IOException e) {
            log.error("Failed to delete file: {}", fileUrl, e);
            // Don't throw exception - file might already be deleted
            // This is a cleanup operation and shouldn't fail the main operation
        }
    }

    /**
     * Validate uploaded file
     * Checks: not empty, allowed content type, size limit
     */
    private void validateFile(MultipartFile file) {
        // Check if file is empty
        if (file.isEmpty()) {
            throw new InvalidFileException("Cannot upload empty file");
        }

        // Check file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new InvalidFileException(
                    String.format("File size exceeds maximum limit of %d MB", MAX_FILE_SIZE / (1024 * 1024)));
        }

        // Check content type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new InvalidFileException(
                    "Invalid file type. Only JPEG and PNG images are allowed");
        }

        // Check filename
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.contains("..")) {
            throw new InvalidFileException("Invalid file name");
        }
    }

    /**
     * Extract file extension from filename
     */
    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1) {
            return ".jpg"; // Default extension
        }
        return filename.substring(lastDotIndex);
    }
}

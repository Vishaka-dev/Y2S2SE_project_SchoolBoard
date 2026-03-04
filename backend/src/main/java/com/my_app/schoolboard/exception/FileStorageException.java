package com.my_app.schoolboard.exception;

/**
 * Exception thrown when file storage operations fail
 * Used for I/O errors, permission issues, or storage unavailability
 */
public class FileStorageException extends RuntimeException {

    public FileStorageException(String message) {
        super(message);
    }

    public FileStorageException(String message, Throwable cause) {
        super(message, cause);
    }
}

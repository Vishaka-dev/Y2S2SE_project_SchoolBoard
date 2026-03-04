package com.my_app.schoolboard.exception;

/**
 * Exception thrown when file validation fails
 * Used for invalid file types, size limits, or empty files
 */
public class InvalidFileException extends RuntimeException {

    public InvalidFileException(String message) {
        super(message);
    }

    public InvalidFileException(String message, Throwable cause) {
        super(message, cause);
    }
}

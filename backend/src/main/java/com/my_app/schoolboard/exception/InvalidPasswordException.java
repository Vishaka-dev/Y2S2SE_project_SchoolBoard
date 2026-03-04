package com.my_app.schoolboard.exception;

/**
 * Exception thrown when password validation fails
 */
public class InvalidPasswordException extends RuntimeException {

    public InvalidPasswordException(String message) {
        super(message);
    }
}

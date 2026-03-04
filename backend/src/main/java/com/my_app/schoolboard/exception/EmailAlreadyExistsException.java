package com.my_app.schoolboard.exception;

/**
 * Exception thrown when attempting to use an email that already exists
 */
public class EmailAlreadyExistsException extends RuntimeException {

    public EmailAlreadyExistsException(String email) {
        super(String.format("Email '%s' is already in use", email));
    }

    public EmailAlreadyExistsException(String message, String email) {
        super(message);
    }
}

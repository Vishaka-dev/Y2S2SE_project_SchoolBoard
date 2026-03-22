package com.my_app.schoolboard.exception;

/**
 * Exception thrown when a user attempts an unauthorized operation
 */
public class UnauthorizedOperationException extends RuntimeException {

    public UnauthorizedOperationException(String message) {
        super(message);
    }
}

package com.my_app.schoolboard.exception;

/**
 * Exception thrown when attempting to access a deleted account
 */
public class AccountDeletedException extends RuntimeException {

    public AccountDeletedException(String message) {
        super(message);
    }

    public AccountDeletedException() {
        super("This account has been deleted");
    }
}

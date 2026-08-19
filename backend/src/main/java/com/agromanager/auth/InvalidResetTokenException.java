package com.agromanager.auth;

public class InvalidResetTokenException extends RuntimeException {

    public InvalidResetTokenException() {
        super("Invalid or expired password reset token");
    }
}
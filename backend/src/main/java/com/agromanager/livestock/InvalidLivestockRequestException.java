package com.agromanager.livestock;

public class InvalidLivestockRequestException extends RuntimeException {

    public InvalidLivestockRequestException(String message) {
        super(message);
    }
}

package com.agromanager.farm;

public class FarmAccessDeniedException extends RuntimeException {

    public FarmAccessDeniedException(String message) {
        super(message);
    }
}
package com.agromanager.weather;

public class MissingFarmCoordinatesException extends RuntimeException {

    public MissingFarmCoordinatesException(String message) {
        super(message);
    }
}

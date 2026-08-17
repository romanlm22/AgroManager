package com.agromanager.auth;

public record AuthResponse(
        String token,
        String email,
        String firstName,
        String lastName,
        String role
) {}
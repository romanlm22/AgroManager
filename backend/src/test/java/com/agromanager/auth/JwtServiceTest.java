package com.agromanager.auth;

import com.agromanager.user.Role;
import com.agromanager.user.User;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    private static final String SECRET = "a".repeat(64);

    private UserDetailsImpl userDetails(String email) {
        return new UserDetailsImpl(User.builder()
                .id(UUID.randomUUID())
                .email(email)
                .passwordHash("hash")
                .firstName("Ana")
                .lastName("Perez")
                .role(Role.AGRONOMIST)
                .enabled(true)
                .build());
    }

    @Test
    void generatedTokenIsValidForItsOwner() {
        JwtService jwtService = new JwtService(SECRET, 60_000);
        UserDetailsImpl user = userDetails("ana@mail.com");

        String token = jwtService.generateToken(user);

        assertThat(jwtService.extractEmail(token)).isEqualTo("ana@mail.com");
        assertThat(jwtService.isTokenValid(token, user)).isTrue();
    }

    @Test
    void tokenIsNotValidForAnotherUser() {
        JwtService jwtService = new JwtService(SECRET, 60_000);

        String token = jwtService.generateToken(userDetails("ana@mail.com"));

        assertThat(jwtService.isTokenValid(token, userDetails("otro@mail.com"))).isFalse();
    }

    @Test
    void expiredTokenIsRejected() {
        JwtService jwtService = new JwtService(SECRET, -1_000);

        String token = jwtService.generateToken(userDetails("ana@mail.com"));

        assertThatThrownBy(() -> jwtService.extractEmail(token)).isInstanceOf(JwtException.class);
    }

    @Test
    void tokenSignedWithAnotherSecretIsRejected() {
        JwtService issuer = new JwtService("b".repeat(64), 60_000);
        JwtService verifier = new JwtService(SECRET, 60_000);

        String token = issuer.generateToken(userDetails("ana@mail.com"));

        assertThatThrownBy(() -> verifier.extractEmail(token)).isInstanceOf(JwtException.class);
    }

    @Test
    void garbageIsRejected() {
        JwtService jwtService = new JwtService(SECRET, 60_000);

        assertThatThrownBy(() -> jwtService.extractEmail("not-a-jwt")).isInstanceOf(JwtException.class);
    }
}

package com.agromanager.auth;

import com.agromanager.user.User;
import com.agromanager.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private static final int RESET_TOKEN_VALIDITY_MINUTES = 15;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new EmailAlreadyInUseException(normalizedEmail);
        }

        User user = User.builder()
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(request.password()))
                .firstName(request.firstName())
                .lastName(request.lastName())
                .role(request.role())
                .enabled(true)
                .build();

        userRepository.save(user);

        String token = jwtService.generateToken(new UserDetailsImpl(user));

        return toAuthResponse(user, token);
    }

    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        normalizedEmail, request.password())
        );

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new IllegalStateException(
                        "Authenticated user not found: " + normalizedEmail));

        String token = jwtService.generateToken(new UserDetailsImpl(user));

        return toAuthResponse(user, token);
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();

        userRepository.findByEmail(normalizedEmail).ifPresent(user -> {
            passwordResetTokenRepository.invalidateAllActiveTokensForUser(user.getId());

            String rawToken = generateSecureToken();

            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .user(user)
                    .tokenHash(passwordEncoder.encode(rawToken))
                    .expiresAt(Instant.now().plus(RESET_TOKEN_VALIDITY_MINUTES, ChronoUnit.MINUTES))
                    .build();

            passwordResetTokenRepository.save(resetToken);

            // TODO: reemplazar por envío real de email cuando se integre un proveedor SMTP.
            log.info("Password reset token for {}: {}", normalizedEmail, rawToken);
        });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken matchedToken = passwordResetTokenRepository.findAll().stream()
                .filter(t -> !t.isUsed())
                .filter(t -> passwordEncoder.matches(request.token(), t.getTokenHash()))
                .findFirst()
                .orElseThrow(InvalidResetTokenException::new);

        if (matchedToken.isExpired()) {
            throw new InvalidResetTokenException();
        }

        User user = matchedToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        matchedToken.setUsedAt(Instant.now());
        passwordResetTokenRepository.save(matchedToken);
    }

    private String generateSecureToken() {
        SecureRandom secureRandom = new SecureRandom();
        byte[] tokenBytes = new byte[32];
        secureRandom.nextBytes(tokenBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
    }

    private AuthResponse toAuthResponse(User user, String token) {
        return new AuthResponse(
                token,
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole().name()
        );
    }
}
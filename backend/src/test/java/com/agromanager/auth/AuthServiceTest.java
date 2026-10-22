package com.agromanager.auth;

import com.agromanager.user.Role;
import com.agromanager.user.User;
import com.agromanager.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest(String email, Role role) {
        return new RegisterRequest(email, "secret123", "Ana", "Perez", role);
    }

    private User existingUser() {
        return User.builder()
                .id(UUID.randomUUID())
                .email("ana@mail.com")
                .passwordHash("old-hash")
                .firstName("Ana")
                .lastName("Perez")
                .role(Role.PRODUCER)
                .enabled(true)
                .build();
    }

    // ---------- register ----------

    @Test
    void register_normalizesEmailAndHashesPassword() {
        when(userRepository.existsByEmail("ana@mail.com")).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("hashed");
        when(jwtService.generateToken(any(UserDetailsImpl.class))).thenReturn("jwt-token");

        AuthResponse response = authService.register(registerRequest("  Ana@Mail.COM ", Role.PRODUCER));

        ArgumentCaptor<User> saved = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(saved.capture());
        assertThat(saved.getValue().getEmail()).isEqualTo("ana@mail.com");
        assertThat(saved.getValue().getPasswordHash()).isEqualTo("hashed");
        assertThat(saved.getValue().getRole()).isEqualTo(Role.PRODUCER);

        assertThat(response.token()).isEqualTo("jwt-token");
        assertThat(response.email()).isEqualTo("ana@mail.com");
        assertThat(response.role()).isEqualTo("PRODUCER");
    }

    @ParameterizedTest
    @EnumSource(value = Role.class, names = {"PRODUCER", "AGRONOMIST", "EMPLOYEE"})
    void register_acceptsSelfRegistrationRoles(Role role) {
        when(userRepository.existsByEmail("ana@mail.com")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed");
        when(jwtService.generateToken(any(UserDetailsImpl.class))).thenReturn("jwt-token");

        AuthResponse response = authService.register(registerRequest("ana@mail.com", role));

        assertThat(response.role()).isEqualTo(role.name());
    }

    @Test
    void register_rejectsAdminRole() {
        assertThatThrownBy(() -> authService.register(registerRequest("ana@mail.com", Role.ADMIN)))
                .isInstanceOf(RoleNotAllowedException.class);

        verifyNoInteractions(userRepository, passwordEncoder, jwtService);
    }

    @Test
    void register_rejectsDuplicatedEmail() {
        when(userRepository.existsByEmail("ana@mail.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(registerRequest("ana@mail.com", Role.PRODUCER)))
                .isInstanceOf(EmailAlreadyInUseException.class);

        verify(userRepository, never()).save(any());
    }

    // ---------- login ----------

    @Test
    void login_propagatesBadCredentials() {
        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("bad"));

        assertThatThrownBy(() -> authService.login(new LoginRequest("ana@mail.com", "wrong")))
                .isInstanceOf(BadCredentialsException.class);

        verifyNoInteractions(userRepository, jwtService);
    }

    @Test
    void login_returnsTokenForValidCredentials() {
        User user = existingUser();
        when(userRepository.findByEmail("ana@mail.com")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(any(UserDetailsImpl.class))).thenReturn("jwt-token");

        AuthResponse response = authService.login(new LoginRequest(" ANA@mail.com ", "secret123"));

        assertThat(response.token()).isEqualTo("jwt-token");
        assertThat(response.email()).isEqualTo("ana@mail.com");
    }

    // ---------- forgot / reset password ----------

    @Test
    void forgotPassword_doesNothingForUnknownEmail() {
        when(userRepository.findByEmail("nadie@mail.com")).thenReturn(Optional.empty());

        authService.forgotPassword(new ForgotPasswordRequest("nadie@mail.com"));

        verifyNoInteractions(passwordResetTokenRepository);
    }

    @Test
    void forgotPassword_storesOnlyTheHashOfAnExpiringToken() {
        User user = existingUser();
        when(userRepository.findByEmail("ana@mail.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.encode(anyString())).thenReturn("token-hash");

        authService.forgotPassword(new ForgotPasswordRequest("ana@mail.com"));

        verify(passwordResetTokenRepository).invalidateAllActiveTokensForUser(user.getId());

        ArgumentCaptor<PasswordResetToken> saved = ArgumentCaptor.forClass(PasswordResetToken.class);
        verify(passwordResetTokenRepository).save(saved.capture());
        assertThat(saved.getValue().getTokenHash()).isEqualTo("token-hash");
        assertThat(saved.getValue().getUser()).isSameAs(user);
        assertThat(saved.getValue().getExpiresAt())
                .isBetween(Instant.now().plus(14, ChronoUnit.MINUTES), Instant.now().plus(16, ChronoUnit.MINUTES));
    }

    @Test
    void resetPassword_rejectsUnknownToken() {
        when(passwordResetTokenRepository.findAll()).thenReturn(List.of());

        assertThatThrownBy(() -> authService.resetPassword(new ResetPasswordRequest("raw", "newPass123")))
                .isInstanceOf(InvalidResetTokenException.class);
    }

    @Test
    void resetPassword_rejectsExpiredToken() {
        PasswordResetToken expired = PasswordResetToken.builder()
                .user(existingUser())
                .tokenHash("hash")
                .expiresAt(Instant.now().minus(1, ChronoUnit.MINUTES))
                .build();
        when(passwordResetTokenRepository.findAll()).thenReturn(List.of(expired));
        when(passwordEncoder.matches("raw", "hash")).thenReturn(true);

        assertThatThrownBy(() -> authService.resetPassword(new ResetPasswordRequest("raw", "newPass123")))
                .isInstanceOf(InvalidResetTokenException.class);

        verify(userRepository, never()).save(any());
    }

    @Test
    void resetPassword_ignoresAlreadyUsedTokens() {
        PasswordResetToken used = PasswordResetToken.builder()
                .user(existingUser())
                .tokenHash("hash")
                .expiresAt(Instant.now().plus(5, ChronoUnit.MINUTES))
                .usedAt(Instant.now().minus(1, ChronoUnit.MINUTES))
                .build();
        when(passwordResetTokenRepository.findAll()).thenReturn(List.of(used));

        assertThatThrownBy(() -> authService.resetPassword(new ResetPasswordRequest("raw", "newPass123")))
                .isInstanceOf(InvalidResetTokenException.class);

        verifyNoInteractions(userRepository);
    }

    @Test
    void resetPassword_changesPasswordAndConsumesTheToken() {
        User user = existingUser();
        PasswordResetToken token = PasswordResetToken.builder()
                .user(user)
                .tokenHash("hash")
                .expiresAt(Instant.now().plus(5, ChronoUnit.MINUTES))
                .build();
        when(passwordResetTokenRepository.findAll()).thenReturn(List.of(token));
        when(passwordEncoder.matches("raw", "hash")).thenReturn(true);
        when(passwordEncoder.encode("newPass123")).thenReturn("new-hash");

        authService.resetPassword(new ResetPasswordRequest("raw", "newPass123"));

        assertThat(user.getPasswordHash()).isEqualTo("new-hash");
        assertThat(token.isUsed()).isTrue();
        verify(userRepository).save(user);
        verify(passwordResetTokenRepository).save(token);
    }
}

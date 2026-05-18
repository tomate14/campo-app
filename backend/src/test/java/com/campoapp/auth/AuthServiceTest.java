package com.campoapp.auth;

import com.campoapp.auth.dto.LoginRequest;
import com.campoapp.auth.dto.RegisterRequest;
import com.campoapp.auth.entity.User;
import com.campoapp.auth.repository.UserRepository;
import com.campoapp.auth.service.*;
import com.campoapp.common.exception.BusinessException;
import com.campoapp.common.exception.UnauthorizedException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private TokenService tokenService;
    @Mock private LoginAttemptService loginAttemptService;
    @Mock private AuditService auditService;
    @Mock private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    private User activeUser;

    @BeforeEach
    void setUp() {
        activeUser = User.builder()
                .email("jefe@campo.com")
                .name("María López")
                .passwordHash("$2a$12$hashed")
                .active(true)
                .build();
        ReflectionTestUtils.setField(activeUser, "id", "user-001");
    }

    // ── Login ──────────────────────────────────────────────────────────────

    @Test
    void login_withValidCredentials_returnsAuthResponse() {
        when(loginAttemptService.isBlocked(any())).thenReturn(false);
        when(userRepository.findByEmail("jefe@campo.com")).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches("password123", activeUser.getPasswordHash())).thenReturn(true);
        when(tokenService.generateAccessToken(activeUser)).thenReturn("access.token.jwt");
        when(tokenService.generateRefreshToken(activeUser)).thenReturn("refresh-token-raw");

        var response = authService.login(new LoginRequest("jefe@campo.com", "password123"), "127.0.0.1");

        assertThat(response.accessToken()).isEqualTo("access.token.jwt");
        assertThat(response.refreshToken()).isEqualTo("refresh-token-raw");
        assertThat(response.user().email()).isEqualTo("jefe@campo.com");
        verify(loginAttemptService).recordSuccessfulLogin("jefe@campo.com");
    }

    @Test
    void login_withWrongPassword_throwsUnauthorizedException() {
        when(loginAttemptService.isBlocked(any())).thenReturn(false);
        when(userRepository.findByEmail("jefe@campo.com")).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches(any(), any())).thenReturn(false);

        assertThatThrownBy(() ->
                authService.login(new LoginRequest("jefe@campo.com", "wrong"), "127.0.0.1"))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("inválidas");

        verify(auditService).log(eq("user-001"), eq("LOGIN_FAILED"), any(), any(), any());
    }

    @Test
    void login_withUnknownEmail_throwsUnauthorizedException() {
        when(loginAttemptService.isBlocked(any())).thenReturn(false);
        when(userRepository.findByEmail(any())).thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                authService.login(new LoginRequest("noexiste@campo.com", "pass"), "127.0.0.1"))
                .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    void login_whenRateLimitExceeded_throwsUnauthorizedException() {
        when(loginAttemptService.isBlocked("jefe@campo.com")).thenReturn(true);

        assertThatThrownBy(() ->
                authService.login(new LoginRequest("jefe@campo.com", "pass"), "127.0.0.1"))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("bloqueada");

        verify(userRepository, never()).findByEmail(any());
    }

    @Test
    void login_withInactiveUser_throwsUnauthorizedException() {
        activeUser.setActive(false);
        when(loginAttemptService.isBlocked(any())).thenReturn(false);
        when(userRepository.findByEmail("jefe@campo.com")).thenReturn(Optional.of(activeUser));

        assertThatThrownBy(() ->
                authService.login(new LoginRequest("jefe@campo.com", "pass"), "127.0.0.1"))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("inactiva");
    }

    // ── Register ───────────────────────────────────────────────────────────

    @Test
    void register_withValidData_createsUserAndReturnsTokens() {
        when(userRepository.existsByEmail("nuevo@campo.com")).thenReturn(false);
        when(passwordEncoder.encode("Password1!")).thenReturn("$2a$12$hashed");
        when(userRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(tokenService.generateAccessToken(any())).thenReturn("access.token");
        when(tokenService.generateRefreshToken(any())).thenReturn("refresh.token");

        var request = new RegisterRequest("nuevo@campo.com", "Password1!", "Nuevo Operario", null);
        var response = authService.register(request, "127.0.0.1");

        assertThat(response.user().email()).isEqualTo("nuevo@campo.com");
        verify(userRepository).save(argThat(u -> u.getEmail().equals("nuevo@campo.com")));
    }

    @Test
    void register_withDuplicateEmail_throwsBusinessException() {
        when(userRepository.existsByEmail("jefe@campo.com")).thenReturn(true);

        assertThatThrownBy(() ->
                authService.register(
                    new RegisterRequest("jefe@campo.com", "Password1!", "Test", null), "127.0.0.1"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("ya existe");
    }

    // ── Logout ─────────────────────────────────────────────────────────────

    @Test
    void logout_revokesAllUserTokens() {
        authService.logout("user-001", "127.0.0.1");

        verify(tokenService).revokeAllTokens("user-001");
        verify(auditService).log(eq("user-001"), eq("LOGOUT"), any(), any(), any());
    }
}

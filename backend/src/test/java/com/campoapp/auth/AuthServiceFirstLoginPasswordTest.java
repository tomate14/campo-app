package com.campoapp.auth;

import com.campoapp.auth.dto.FirstLoginChangePasswordRequest;
import com.campoapp.auth.dto.LoginRequest;
import com.campoapp.auth.entity.User;
import com.campoapp.auth.repository.UserRepository;
import com.campoapp.auth.service.*;
import com.campoapp.common.exception.BusinessException;
import com.campoapp.common.exception.UnauthorizedException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Tests del cambio obligatorio de contraseña en primer login (feature 39).
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceFirstLoginPasswordTest {

    @Mock private UserRepository userRepository;
    @Mock private TokenService tokenService;
    @Mock private LoginAttemptService loginAttemptService;
    @Mock private AuditService auditService;
    @Mock private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    private User operarioUser;

    @BeforeEach
    void setUp() {
        // Usuario generado desde operarios: email = username, contraseña inicial = username
        operarioUser = User.builder()
                .email("jperez")
                .name("Juan Pérez")
                .passwordHash("$2a$12$initialHash")
                .active(true)
                .mustChangePassword(true)
                .build();
        ReflectionTestUtils.setField(operarioUser, "id", "user-op-001");
    }

    // ── Cambio exitoso ─────────────────────────────────────────────────────

    @Test
    void changeInitialPassword_withValidData_updatesHashClearsFlagAndReturnsNewTokens() {
        when(userRepository.findActiveById("user-op-001")).thenReturn(Optional.of(operarioUser));
        when(passwordEncoder.matches("jperez", "$2a$12$initialHash")).thenReturn(true);
        when(passwordEncoder.encode("Nueva1!segura")).thenReturn("$2a$12$newHash");
        when(userRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(tokenService.generateAccessToken(operarioUser)).thenReturn("new.access.jwt");
        when(tokenService.generateRefreshToken(operarioUser)).thenReturn("new-refresh-raw");

        var request = new FirstLoginChangePasswordRequest("jperez", "Nueva1!segura");
        var response = authService.changeInitialPassword("user-op-001", request, "127.0.0.1");

        // Hash actualizado y flag apagado
        assertThat(operarioUser.getPasswordHash()).isEqualTo("$2a$12$newHash");
        assertThat(operarioUser.isMustChangePassword()).isFalse();
        verify(userRepository).save(operarioUser);

        // Se revocan las sesiones previas ANTES de generar los tokens nuevos
        InOrder inOrder = inOrder(tokenService);
        inOrder.verify(tokenService).revokeAllTokens("user-op-001");
        inOrder.verify(tokenService).generateAccessToken(operarioUser);
        inOrder.verify(tokenService).generateRefreshToken(operarioUser);

        // Respuesta completa con flag en false
        assertThat(response.accessToken()).isEqualTo("new.access.jwt");
        assertThat(response.refreshToken()).isEqualTo("new-refresh-raw");
        assertThat(response.user().mustChangePassword()).isFalse();
        verify(auditService).log(eq("user-op-001"), eq("FIRST_LOGIN_PASSWORD_CHANGED"), any(), any(), any());
    }

    // ── Contraseña actual incorrecta ───────────────────────────────────────

    @Test
    void changeInitialPassword_withWrongCurrentPassword_throwsUnauthorizedException() {
        when(userRepository.findActiveById("user-op-001")).thenReturn(Optional.of(operarioUser));
        when(passwordEncoder.matches("incorrecta", "$2a$12$initialHash")).thenReturn(false);

        var request = new FirstLoginChangePasswordRequest("incorrecta", "Nueva1!segura");

        assertThatThrownBy(() ->
                authService.changeInitialPassword("user-op-001", request, "127.0.0.1"))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("inválidas");

        verify(auditService).log(eq("user-op-001"), eq("FIRST_LOGIN_PASSWORD_CHANGE_FAILED"), any(), any(), any());
        verify(userRepository, never()).save(any());
        verify(tokenService, never()).revokeAllTokens(any());
    }

    // ── Nueva contraseña igual a la inicial ────────────────────────────────

    @Test
    void changeInitialPassword_withNewPasswordEqualToUsername_throwsBusinessException() {
        when(userRepository.findActiveById("user-op-001")).thenReturn(Optional.of(operarioUser));
        when(passwordEncoder.matches("jperez", "$2a$12$initialHash")).thenReturn(true);

        // La nueva contraseña coincide (case-insensitive) con el email/username inicial
        var request = new FirstLoginChangePasswordRequest("jperez", "JPEREZ");

        assertThatThrownBy(() ->
                authService.changeInitialPassword("user-op-001", request, "127.0.0.1"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("no puede ser igual");

        verify(userRepository, never()).save(any());
        verify(tokenService, never()).revokeAllTokens(any());
    }

    // ── Usuario sin cambio pendiente ───────────────────────────────────────

    @Test
    void changeInitialPassword_whenNoPendingChange_throwsBusinessException() {
        operarioUser.setMustChangePassword(false);
        when(userRepository.findActiveById("user-op-001")).thenReturn(Optional.of(operarioUser));

        var request = new FirstLoginChangePasswordRequest("jperez", "Nueva1!segura");

        assertThatThrownBy(() ->
                authService.changeInitialPassword("user-op-001", request, "127.0.0.1"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("pendiente");

        verify(passwordEncoder, never()).matches(any(), any());
        verify(userRepository, never()).save(any());
    }

    // ── Login con flag pendiente ───────────────────────────────────────────

    @Test
    void login_withPendingPasswordChange_returnsMustChangePasswordTrue() {
        when(loginAttemptService.isBlocked(any())).thenReturn(false);
        when(userRepository.findByEmail("jperez")).thenReturn(Optional.of(operarioUser));
        when(passwordEncoder.matches("jperez", "$2a$12$initialHash")).thenReturn(true);
        when(tokenService.generateAccessToken(operarioUser)).thenReturn("access.jwt");
        when(tokenService.generateRefreshToken(operarioUser)).thenReturn("refresh-raw");

        var response = authService.login(new LoginRequest("jperez", "jperez"), "127.0.0.1");

        assertThat(response.user().mustChangePassword()).isTrue();
    }
}

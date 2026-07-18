package com.campoapp.auth.service;

import com.campoapp.auth.dto.AuthResponse;
import com.campoapp.auth.dto.FirstLoginChangePasswordRequest;
import com.campoapp.auth.dto.LoginRequest;
import com.campoapp.auth.dto.RegisterRequest;
import com.campoapp.auth.entity.User;
import com.campoapp.auth.repository.UserRepository;
import com.campoapp.common.exception.BusinessException;
import com.campoapp.common.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final TokenService tokenService;
    private final LoginAttemptService loginAttemptService;
    private final AuditService auditService;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public AuthResponse login(LoginRequest request, String ipAddress) {
        // Verificar rate limit antes de intentar autenticación
        if (loginAttemptService.isBlocked(request.email())) {
            auditService.log(null, "LOGIN_BLOCKED", "auth", null, ipAddress);
            throw new UnauthorizedException("Cuenta bloqueada temporalmente por múltiples intentos fallidos. Intentá de nuevo en 15 minutos.");
        }

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> {
                    // Consumir intento aunque el usuario no exista (evitar enumeración)
                    loginAttemptService.isBlocked(request.email());
                    return new UnauthorizedException("Credenciales inválidas");
                });

        if (!user.isActive()) {
            throw new UnauthorizedException("Cuenta inactiva. Contactá al administrador.");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            auditService.log(user.getId(), "LOGIN_FAILED", "auth", user.getId(), ipAddress);
            throw new UnauthorizedException("Credenciales inválidas");
        }

        loginAttemptService.recordSuccessfulLogin(request.email());

        String accessToken = tokenService.generateAccessToken(user);
        String refreshToken = tokenService.generateRefreshToken(user);

        auditService.log(user.getId(), "LOGIN_SUCCESS", "auth", user.getId(), ipAddress);
        log.info("Login exitoso para usuario: {}", user.getEmail());

        return buildAuthResponse(user, accessToken, refreshToken);
    }

    @Transactional
    public AuthResponse register(RegisterRequest request, String ipAddress) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessException("Ya existe un usuario con el email: " + request.email());
        }

        User user = User.builder()
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .name(request.name())
                .phone(request.phone())
                .active(true)
                .emailVerified(false)
                .build();

        userRepository.save(user);
        auditService.log(user.getId(), "USER_REGISTERED", "users", user.getId(), ipAddress);
        log.info("Nuevo usuario registrado: {}", user.getEmail());

        String accessToken = tokenService.generateAccessToken(user);
        String refreshToken = tokenService.generateRefreshToken(user);

        return buildAuthResponse(user, accessToken, refreshToken);
    }

    @Transactional
    public String refreshToken(String rawRefreshToken) {
        return tokenService.refreshAccessToken(rawRefreshToken);
    }

    @Transactional
    public void logout(String userId, String ipAddress) {
        tokenService.revokeAllTokens(userId);
        auditService.log(userId, "LOGOUT", "auth", userId, ipAddress);
    }

    public User getCurrentUser(String userId) {
        return userRepository.findActiveById(userId)
                .orElseThrow(() -> new UnauthorizedException("Usuario no encontrado"));
    }

    /**
     * Cambio obligatorio de contraseña en primer login (feature 39).
     * Solo aplica a usuarios con el flag mustChangePassword activo (generados desde operarios).
     * Revoca todas las sesiones previas y devuelve tokens nuevos.
     */
    @Transactional
    public AuthResponse changeInitialPassword(String userId, FirstLoginChangePasswordRequest request, String ipAddress) {
        User user = getCurrentUser(userId);

        if (!user.isMustChangePassword()) {
            throw new BusinessException("El usuario no tiene un cambio de contraseña inicial pendiente");
        }

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            auditService.log(user.getId(), "FIRST_LOGIN_PASSWORD_CHANGE_FAILED", "auth", user.getId(), ipAddress);
            throw new UnauthorizedException("Credenciales inválidas");
        }

        // La contraseña inicial es igual al username/email: la nueva no puede repetirla
        if (request.newPassword().equals(request.currentPassword())
                || request.newPassword().equalsIgnoreCase(user.getEmail())) {
            throw new BusinessException("La nueva contraseña no puede ser igual a la contraseña inicial");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        user.setMustChangePassword(false);
        userRepository.save(user);

        // Invalidar sesiones previas antes de emitir los tokens nuevos
        tokenService.revokeAllTokens(user.getId());

        String accessToken = tokenService.generateAccessToken(user);
        String refreshToken = tokenService.generateRefreshToken(user);

        auditService.log(user.getId(), "FIRST_LOGIN_PASSWORD_CHANGED", "auth", user.getId(), ipAddress);
        log.info("Cambio de contraseña inicial completado para usuario: {}", user.getEmail());

        return buildAuthResponse(user, accessToken, refreshToken);
    }

    private AuthResponse buildAuthResponse(User user, String accessToken, String refreshToken) {
        return new AuthResponse(
                accessToken,
                refreshToken,
                new AuthResponse.UserDto(
                        user.getId(),
                        user.getEmail(),
                        user.getName(),
                        user.getRoleNames(),
                        user.getPermissionNames(),
                        user.isMustChangePassword()
                )
        );
    }
}

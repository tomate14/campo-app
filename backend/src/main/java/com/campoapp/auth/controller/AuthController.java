package com.campoapp.auth.controller;

import com.campoapp.auth.dto.*;
import com.campoapp.auth.service.AuthService;
import com.campoapp.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticación", description = "Login, registro y gestión de tokens")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión", description = "Autentica con email y contraseña. Bloquea tras 5 intentos fallidos.")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {
        AuthResponse response = authService.login(request, getClientIp(httpRequest));
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/register")
    @Operation(summary = "Registrar nuevo usuario")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletRequest httpRequest) {
        AuthResponse response = authService.register(request, getClientIp(httpRequest));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Renovar access token usando refresh token")
    public ResponseEntity<ApiResponse<String>> refresh(
            @Valid @RequestBody RefreshTokenRequest request) {
        String newAccessToken = authService.refreshToken(request.refreshToken());
        return ResponseEntity.ok(ApiResponse.ok(newAccessToken));
    }

    @PostMapping("/logout")
    @Operation(summary = "Cerrar sesión y revocar todos los tokens del usuario")
    public ResponseEntity<ApiResponse<Void>> logout(
            @AuthenticationPrincipal String userId,
            HttpServletRequest httpRequest) {
        authService.logout(userId, getClientIp(httpRequest));
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @GetMapping("/me")
    @Operation(summary = "Obtener datos del usuario autenticado")
    public ResponseEntity<ApiResponse<AuthResponse.UserDto>> me(
            @AuthenticationPrincipal String userId) {
        var user = authService.getCurrentUser(userId);
        var userDto = new AuthResponse.UserDto(
                user.getId(), user.getEmail(), user.getName(),
                user.getRoleNames(), user.getPermissionNames()
        );
        return ResponseEntity.ok(ApiResponse.ok(userDto));
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        return (xfHeader != null) ? xfHeader.split(",")[0].trim() : request.getRemoteAddr();
    }
}

package com.campoapp.auth.dto;

import java.util.Set;

public record AuthResponse(
    String accessToken,
    String refreshToken,
    UserDto user
) {
    public record UserDto(
        String id,
        String email,
        String name,
        Set<String> roles,
        Set<String> permissions
    ) {}
}

package com.campoapp.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
    // Sin @Email: los usuarios generados desde operarios (feature 12) usan un
    // username sin formato de email en esta misma columna y deben poder loguearse.
    @NotBlank(message = "El email o usuario es obligatorio")
    String email,

    @NotBlank(message = "La contraseña es obligatoria")
    String password
) {}

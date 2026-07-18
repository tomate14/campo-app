package com.campoapp.auth.dto;

import jakarta.validation.constraints.*;

/**
 * Request de cambio obligatorio de contraseña en primer login
 * (usuarios generados desde operarios con contraseña inicial = username).
 */
public record FirstLoginChangePasswordRequest(
    @NotBlank(message = "La contraseña actual es obligatoria")
    String currentPassword,

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).{8,}$",
        message = "La contraseña debe incluir mayúsculas, minúsculas, números y símbolos"
    )
    String newPassword
) {}

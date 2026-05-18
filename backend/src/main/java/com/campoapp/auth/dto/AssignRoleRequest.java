package com.campoapp.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record AssignRoleRequest(
    @NotBlank(message = "El rol es obligatorio")
    String roleName
) {}

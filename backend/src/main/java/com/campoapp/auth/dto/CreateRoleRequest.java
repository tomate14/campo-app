package com.campoapp.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateRoleRequest(
        @NotBlank String name,
        String description,
        Boolean enableAllMenuOptions
) {
}

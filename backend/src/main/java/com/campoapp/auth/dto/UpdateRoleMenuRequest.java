package com.campoapp.auth.dto;

import jakarta.validation.constraints.NotNull;

import java.util.List;

public record UpdateRoleMenuRequest(
        @NotNull List<String> menuKeys
) {
}

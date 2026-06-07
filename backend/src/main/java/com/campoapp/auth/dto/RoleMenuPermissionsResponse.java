package com.campoapp.auth.dto;

import java.util.List;

public record RoleMenuPermissionsResponse(
        String roleId,
        String roleName,
        String description,
        List<MenuOptionResponse> options
) {
}

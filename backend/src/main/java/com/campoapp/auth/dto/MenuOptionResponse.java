package com.campoapp.auth.dto;

public record MenuOptionResponse(
        String id,
        String key,
        String label,
        String route,
        String section,
        String icon,
        Integer displayOrder,
        Boolean enabled
) {
}

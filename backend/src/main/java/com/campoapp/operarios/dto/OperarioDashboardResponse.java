package com.campoapp.operarios.dto;

public record OperarioDashboardResponse(
        long totalOperarios,
        long activos,
        long disponibles,
        long documentosVencidos
) {
}

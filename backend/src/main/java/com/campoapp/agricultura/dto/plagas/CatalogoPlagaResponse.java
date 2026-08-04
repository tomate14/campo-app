package com.campoapp.agricultura.dto.plagas;

import java.time.LocalDateTime;

public record CatalogoPlagaResponse(
        String id,
        String nombreComun,
        String nombreCientifico,
        String tipo,
        String cultivosAfectados,
        String descripcion,
        String sintomas,
        String umbralAccion,
        Boolean activo,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}

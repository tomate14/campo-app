package com.campoapp.agricultura.dto.plagas;

import java.time.LocalDateTime;

public record CatalogoPlagaResponse(
        String id,
        String nombreComun,
        String nombreCientifico,
        String tipo,
        // Feature 72: valor resuelto del catalogo TIPO_PLAGA (tipo sigue siendo el id).
        String tipoNombre,
        String cultivosAfectados,
        String descripcion,
        String sintomas,
        String umbralAccion,
        Boolean activo,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}

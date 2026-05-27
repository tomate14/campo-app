package com.campoapp.agricultura.dto.plagas;

import com.campoapp.agricultura.entity.plagas.TipoPlaga;
import java.time.LocalDateTime;

public record CatalogoPlagaResponse(
        String id,
        String nombreComun,
        String nombreCientifico,
        TipoPlaga tipo,
        String cultivosAfectados,
        String descripcion,
        String sintomas,
        String umbralAccion,
        Boolean activo,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}

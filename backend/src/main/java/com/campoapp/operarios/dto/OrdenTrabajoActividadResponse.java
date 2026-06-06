package com.campoapp.operarios.dto;

import java.time.LocalDateTime;

public record OrdenTrabajoActividadResponse(
        String id,
        String ordenId,
        String operarioId,
        String operarioNombre,
        String tipo,
        String descripcion,
        LocalDateTime inicio,
        LocalDateTime fin,
        Integer duracionMin,
        String estado,
        String evidenciaUrl,
        String observaciones,
        LocalDateTime createdAt
) {
}

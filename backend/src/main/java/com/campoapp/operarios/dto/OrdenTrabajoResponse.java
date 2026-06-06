package com.campoapp.operarios.dto;

import java.time.LocalDateTime;
import java.util.List;

public record OrdenTrabajoResponse(
        String id,
        String codigo,
        String titulo,
        String descripcion,
        String loteId,
        String loteNombre,
        String zona,
        String operarioId,
        String operarioNombre,
        String prioridad,
        String estado,
        LocalDateTime fechaProgramada,
        LocalDateTime fechaInicio,
        LocalDateTime fechaFinEstimada,
        LocalDateTime fechaFinReal,
        Integer duracionEstimadaMin,
        Integer duracionRealMin,
        String resultado,
        String motivoRechazo,
        String observaciones,
        List<OrdenTrabajoActividadResponse> actividades,
        List<OrdenTrabajoHistorialResponse> historial,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}

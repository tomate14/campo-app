package com.campoapp.operarios.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record OperarioHistorialRolResponse(
        String id,
        String operarioId,
        String operarioNombre,
        String rolAnterior,
        String rolNuevo,
        LocalDate fecha,
        String responsable,
        String motivo,
        LocalDateTime createdAt
) {
}

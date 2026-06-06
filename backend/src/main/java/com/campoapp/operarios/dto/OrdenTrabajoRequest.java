package com.campoapp.operarios.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

public record OrdenTrabajoRequest(
        @NotBlank String titulo,
        String descripcion,
        String loteId,
        String zona,
        @NotBlank String operarioId,
        String prioridad,
        String estado,
        LocalDateTime fechaProgramada,
        LocalDateTime fechaInicio,
        LocalDateTime fechaFinEstimada,
        LocalDateTime fechaFinReal,
        Integer duracionEstimadaMin,
        Integer duracionRealMin,
        String resultado,
        String observaciones
) {
}

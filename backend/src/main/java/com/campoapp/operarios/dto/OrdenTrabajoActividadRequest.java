package com.campoapp.operarios.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

public record OrdenTrabajoActividadRequest(
        String operarioId,
        @NotBlank String tipo,
        @NotBlank String descripcion,
        LocalDateTime inicio,
        LocalDateTime fin,
        Integer duracionMin,
        String estado,
        String evidenciaUrl,
        String observaciones
) {
}

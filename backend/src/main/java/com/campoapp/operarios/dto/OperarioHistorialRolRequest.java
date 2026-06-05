package com.campoapp.operarios.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record OperarioHistorialRolRequest(
        @NotBlank String operarioId,
        @NotBlank String rolNuevo,
        LocalDate fecha,
        String responsable,
        String motivo
) {
}

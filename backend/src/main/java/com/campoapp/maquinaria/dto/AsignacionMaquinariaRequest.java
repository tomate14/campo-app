package com.campoapp.maquinaria.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record AsignacionMaquinariaRequest(
        @NotBlank String maquinariaId,
        @NotBlank String operario,
        @NotNull LocalDateTime fechaInicio,
        LocalDateTime fechaFin,
        String actividad,
        String ubicacion,
        String observaciones
) {}

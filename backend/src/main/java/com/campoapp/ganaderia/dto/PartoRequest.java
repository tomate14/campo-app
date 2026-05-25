package com.campoapp.ganaderia.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record PartoRequest(
        @NotBlank String madreId,
        String terneroId,
        @NotNull LocalDate fecha,
        String complicaciones,
        String viabilidadTernero,
        String observaciones
) {}

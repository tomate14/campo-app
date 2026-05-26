package com.campoapp.maquinaria.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MantenimientoProgramadoRequest(
        @NotBlank String maquinariaId,
        String planId,
        @NotNull LocalDate fechaProgramada,
        BigDecimal horometroObjetivo,
        String estado,
        String responsable,
        String observaciones
) {}

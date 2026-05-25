package com.campoapp.ganaderia.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record InseminacionRequest(
        @NotBlank String vacaId,
        @NotNull LocalDate fecha,
        @NotBlank String geneticaUsada,
        String tecnico,
        BigDecimal costo,
        String resultado,
        String observaciones
) {}

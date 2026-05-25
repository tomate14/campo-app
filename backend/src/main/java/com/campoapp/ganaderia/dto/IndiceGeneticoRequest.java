package com.campoapp.ganaderia.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record IndiceGeneticoRequest(
        @NotBlank String animalId,
        @NotNull LocalDate fechaEvaluacion,
        BigDecimal epd,
        BigDecimal dep,
        BigDecimal indiceProductivo,
        String fuente,
        String observaciones
) {}

package com.campoapp.ganaderia.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record DietaIngredienteRequest(
        @NotBlank String ingrediente,
        @NotNull BigDecimal proporcionPct,
        BigDecimal costoKg,
        BigDecimal materiaSecaPct
) {}

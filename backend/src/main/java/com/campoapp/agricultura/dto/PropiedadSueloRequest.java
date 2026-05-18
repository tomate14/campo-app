package com.campoapp.agricultura.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public record PropiedadSueloRequest(
        @NotBlank(message = "El lote es requerido")
        String loteId,

        @NotNull(message = "La fecha del análisis es requerida")
        LocalDate fecha,

        @DecimalMin("0.0") @DecimalMax("14.0")
        BigDecimal ph,

        @DecimalMin("0.0") BigDecimal nitrogenoKgHa,
        @DecimalMin("0.0") BigDecimal fosforoKgHa,
        @DecimalMin("0.0") BigDecimal potasioKgHa,

        @DecimalMin("0.0") @DecimalMax("100.0")
        BigDecimal materiaOrganicaPct,

        @DecimalMin("0.0") BigDecimal conductividadElectrica,

        String observaciones
) {}

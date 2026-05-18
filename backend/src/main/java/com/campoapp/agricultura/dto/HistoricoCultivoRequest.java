package com.campoapp.agricultura.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public record HistoricoCultivoRequest(
        @NotBlank(message = "El lote es requerido")
        String loteId,

        @NotBlank(message = "El cultivo es requerido")
        @Size(max = 50)
        String cultivo,

        @NotBlank(message = "La temporada es requerida")
        @Size(max = 20)
        String temporada,

        LocalDate fechaSiembra,
        LocalDate fechaCosecha,

        @DecimalMin("0.0")
        BigDecimal rendimientoKgHa,

        String observaciones
) {}

package com.campoapp.agricultura.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public record LoteRequest(
        @NotBlank(message = "El nombre del lote es requerido")
        @Size(max = 100)
        String nombre,

        @NotNull(message = "El área es requerida")
        @DecimalMin(value = "0.01", message = "El área debe ser mayor a 0")
        BigDecimal area,

        @NotBlank(message = "El tipo de cultivo es requerido")
        @Size(max = 50)
        String cultivo,

        BigDecimal latitud,
        BigDecimal longitud,

        @NotBlank(message = "La temporada es requerida")
        @Size(max = 20)
        String temporada,

        String poligono,

        BigDecimal phMinimo,
        BigDecimal phMaximo,
        LocalDate fechaSiembra,
        LocalDate fechaCosechaEstimada
) {}

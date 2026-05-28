package com.campoapp.agricultura.dto.plagas;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AplicacionFitosanitariaRequest(
        LocalDateTime fechaAplicacion,
        @NotBlank String producto,
        String principioActivo,
        @NotNull BigDecimal dosis,
        @NotBlank String unidadDosis,
        BigDecimal volumenCaldoLHa,
        BigDecimal superficieTratadaHa,
        Integer periodoCarenciaDias,
        Integer periodoReingresoHoras,
        String maquinariaId,
        @NotBlank String operarioResponsable,
        String condicionesClimaticas,
        String observaciones
) {}

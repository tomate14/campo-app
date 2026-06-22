package com.campoapp.agricultura.dto.plagas;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record AplicacionFitosanitariaResponse(
        String id,
        String deteccionId,
        String loteId,
        String loteNombre,
        LocalDateTime fechaAplicacion,
        String producto,
        String principioActivo,
        BigDecimal dosis,
        String unidadDosis,
        BigDecimal volumenCaldoLHa,
        BigDecimal superficieTratadaHa,
        Integer periodoCarenciaDias,
        Integer periodoReingresoHoras,
        LocalDateTime fechaReingresoSeguro,
        LocalDate fechaCosechaSegura,
        String maquinariaId,
        String operarioResponsableId,
        String operarioResponsable,
        String condicionesClimaticas,
        String observaciones,
        LocalDateTime createdAt
) {}

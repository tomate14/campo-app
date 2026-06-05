package com.campoapp.clima.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PrecipitacionDiariaResponse(
        String id,
        String loteId,
        String loteNombre,
        LocalDate fecha,
        BigDecimal precipitacionMm,
        String fuente
) {}

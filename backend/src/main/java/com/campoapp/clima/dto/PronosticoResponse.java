package com.campoapp.clima.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PronosticoResponse(
        String id,
        String loteId,
        LocalDate fecha,
        BigDecimal tempMax,
        BigDecimal tempMin,
        Integer humedadPct,
        BigDecimal probabilidadLluvia,
        BigDecimal precipitacionMm,
        String descripcion,
        String iconoCodigo,
        BigDecimal velocidadViento,
        Integer condicionCodigo
) {}

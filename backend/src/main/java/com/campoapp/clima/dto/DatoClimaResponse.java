package com.campoapp.clima.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record DatoClimaResponse(
        String id,
        String loteId,
        String loteNombre,
        LocalDateTime timestampUtc,
        BigDecimal temperatura,
        BigDecimal sensacionTermica,
        BigDecimal tempMin,
        BigDecimal tempMax,
        Integer humedadPct,
        Integer presionHpa,
        BigDecimal velocidadViento,
        Integer direccionViento,
        String descripcion,
        String iconoCodigo,
        BigDecimal precipitacionesMm,
        Integer nubosidadPct,
        Integer condicionCodigo,
        String nombreLocalidad,
        LocalDateTime createdAt
) {}

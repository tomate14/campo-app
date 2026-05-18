package com.campoapp.agricultura.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record HistoricoCultivoResponse(
        String id,
        String loteId,
        String loteNombre,
        String cultivo,
        String temporada,
        LocalDate fechaSiembra,
        LocalDate fechaCosecha,
        BigDecimal rendimientoKgHa,
        String observaciones,
        LocalDateTime createdAt
) {}

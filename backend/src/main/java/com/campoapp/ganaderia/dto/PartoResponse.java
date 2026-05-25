package com.campoapp.ganaderia.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record PartoResponse(
        String id,
        String madreId,
        String madreCaravana,
        String terneroId,
        String terneroCaravana,
        LocalDate fecha,
        String complicaciones,
        String viabilidadTernero,
        String observaciones,
        LocalDateTime createdAt
) {}

package com.campoapp.ganaderia.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record InseminacionResponse(
        String id,
        String vacaId,
        String vacaCaravana,
        LocalDate fecha,
        String geneticaUsada,
        String tecnico,
        BigDecimal costo,
        String resultado,
        String observaciones,
        LocalDateTime createdAt
) {}

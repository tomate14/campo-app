package com.campoapp.ganaderia.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/** Alerta de potrero con nombres de potrero y usuario ya resueltos para la UI. */
public record AlertaPotreroResponse(
        String id,
        String potreroId,
        String potreroNombre,
        String usuarioId,
        String usuarioNombre,
        LocalDate fecha,
        String gravedad,
        String observacion,
        BigDecimal latitud,
        BigDecimal longitud,
        String estado,
        String fotoUrl,
        LocalDateTime createdAt
) {}

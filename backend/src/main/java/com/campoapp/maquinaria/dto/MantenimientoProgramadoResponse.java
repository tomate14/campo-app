package com.campoapp.maquinaria.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record MantenimientoProgramadoResponse(
        String id,
        String maquinariaId,
        String maquinariaCodigo,
        String planId,
        String planNombre,
        LocalDate fechaProgramada,
        BigDecimal horometroObjetivo,
        String estado,
        String responsable,
        String observaciones,
        boolean vencido,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}

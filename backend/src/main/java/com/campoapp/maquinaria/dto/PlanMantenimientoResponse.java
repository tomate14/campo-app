package com.campoapp.maquinaria.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PlanMantenimientoResponse(
        String id,
        String maquinariaId,
        String maquinariaCodigo,
        String tipoMaquinaria,
        String modelo,
        String nombre,
        String descripcion,
        BigDecimal intervaloHoras,
        Integer intervaloDias,
        String prioridad,
        Boolean activo,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}

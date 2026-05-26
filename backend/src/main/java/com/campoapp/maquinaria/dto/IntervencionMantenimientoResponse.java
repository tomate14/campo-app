package com.campoapp.maquinaria.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record IntervencionMantenimientoResponse(
        String id,
        String maquinariaId,
        String maquinariaCodigo,
        String planId,
        String planNombre,
        String programacionId,
        LocalDate fecha,
        String tipo,
        String tareasRealizadas,
        String operario,
        BigDecimal horasMaquina,
        BigDecimal manoObraCosto,
        BigDecimal repuestosCosto,
        BigDecimal costoTotal,
        String estadoResultante,
        String observaciones,
        List<RepuestoUtilizadoResponse> repuestos,
        LocalDateTime createdAt
) {}

package com.campoapp.maquinaria.dto;

import java.math.BigDecimal;
import java.util.List;

public record MaquinariaDashboardResponse(
        int total,
        int disponibles,
        int enReparacion,
        int asignadas,
        long documentosVencidos,
        BigDecimal horasMes,
        BigDecimal kilometrosMes,
        List<String> alertas
) {}

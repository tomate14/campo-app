package com.campoapp.maquinaria.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UsoMaquinariaResponse(
        String id,
        String maquinariaId,
        String maquinariaCodigo,
        LocalDate fecha,
        String actividad,
        String lote,
        String operario,
        BigDecimal horasTrabajadas,
        BigDecimal kilometrosRecorridos,
        BigDecimal combustibleLitros,
        String observaciones
) {}

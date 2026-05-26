package com.campoapp.maquinaria.dto;

import java.math.BigDecimal;
import java.util.List;

public record MantenimientoDashboardResponse(
        long planesActivos,
        long mantenimientosPendientes,
        long mantenimientosVencidos,
        long maquinasEnTaller,
        BigDecimal costoMes,
        List<String> alertas
) {}

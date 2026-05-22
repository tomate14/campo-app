package com.campoapp.agricultura.dto;

import java.math.BigDecimal;

public record LoteReporteResponse(
        String loteId,
        String loteNombre,
        String cultivoActual,
        String temporadaActual,
        BigDecimal area,
        Long cantidadEventos,
        Long cantidadCosechas,
        Long cantidadAnalisisSuelo,
        Long cantidadCultivosHistoricos,
        Double rendimientoPromedioKgHa,
        Double rendimientoHistoricoPromedioKgHa,
        String ultimoCultivo,
        String ultimaTemporada
) {}

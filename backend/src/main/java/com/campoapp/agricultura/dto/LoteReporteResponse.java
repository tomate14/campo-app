package com.campoapp.agricultura.dto;

import java.math.BigDecimal;

public record LoteReporteResponse(
        String loteId,
        String loteNombre,
        String cultivoActual,
        // Feature 72: valor resuelto del catalogo CULTIVO (cultivoActual sigue siendo el id).
        String cultivoActualNombre,
        String temporadaActual,
        BigDecimal area,
        Long cantidadEventos,
        Long cantidadCosechas,
        Long cantidadAnalisisSuelo,
        Long cantidadCultivosHistoricos,
        Double rendimientoPromedioKgHa,
        Double rendimientoHistoricoPromedioKgHa,
        String ultimoCultivo,
        // Feature 72: valor resuelto del catalogo CULTIVO (ultimoCultivo sigue siendo el id).
        String ultimoCultivoNombre,
        String ultimaTemporada
) {}

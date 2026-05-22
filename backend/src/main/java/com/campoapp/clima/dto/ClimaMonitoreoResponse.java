package com.campoapp.clima.dto;

import java.util.List;

public record ClimaMonitoreoResponse(
        String loteId,
        DatoClimaResponse actual,
        List<PronosticoResponse> pronostico,
        List<DatoClimaResponse> historico,
        List<AlertaClimaResponse> alertas,
        RecomendacionResponse recomendaciones,
        String proveedor,
        Integer historicoDias,
        Integer pronosticoDiasDisponibles
) {}

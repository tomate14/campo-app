package com.campoapp.agricultura.service;

import com.campoapp.agricultura.dto.AgriculturaAnalyticsResponse;

public interface ReporteService {
    byte[] generarReporteAnalyticsPdf(AgriculturaAnalyticsResponse analytics);
}

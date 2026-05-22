package com.campoapp.agricultura.service;

import com.campoapp.agricultura.dto.AgriculturaAnalyticsResponse;

import java.time.LocalDate;

public interface AnalyticsService {
    AgriculturaAnalyticsResponse obtenerAnalytics(
            String loteId,
            String cultivo,
            String temporada,
            LocalDate desde,
            LocalDate hasta,
            String granularidad
    );
}

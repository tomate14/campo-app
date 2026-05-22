package com.campoapp.agricultura.service;

import com.campoapp.agricultura.dto.AgriculturaAnalyticsResponse;

import java.util.List;

public interface PredictorService {
    AgriculturaAnalyticsResponse.Prediccion estimarSiguientePeriodo(
            List<AgriculturaAnalyticsResponse.SerieTemporal> series,
            String granularidad
    );
}

package com.campoapp.clima.service;

import com.campoapp.clima.dto.RecomendacionResponse;

public interface RecomendacionService {
    RecomendacionResponse obtenerRecomendaciones(String loteId);
}

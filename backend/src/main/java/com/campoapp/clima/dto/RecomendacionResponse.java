package com.campoapp.clima.dto;

import java.util.List;

public record RecomendacionResponse(
        String loteId,
        String loteNombre,
        List<Recomendacion> recomendaciones,
        String condicionGeneral
) {
    public record Recomendacion(
            String categoria,
            String mensaje,
            String prioridad
    ) {}
}

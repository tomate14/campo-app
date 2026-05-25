package com.campoapp.ganaderia.dto;

import java.math.BigDecimal;
import java.util.List;

public record ReproduccionDashboardResponse(
        long montasRegistradas,
        long inseminacionesRegistradas,
        long prenezActivas,
        long partosRegistrados,
        BigDecimal tasaPrenez,
        BigDecimal tasaPartoViable,
        BigDecimal serviciosPorPrenez,
        List<AlertaReproductivaResponse> alertas,
        List<RecomendacionCruzamientoResponse> recomendaciones
) {}

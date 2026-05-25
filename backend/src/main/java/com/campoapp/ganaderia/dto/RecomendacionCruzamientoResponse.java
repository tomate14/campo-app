package com.campoapp.ganaderia.dto;

import java.math.BigDecimal;

public record RecomendacionCruzamientoResponse(
        String vacaId,
        String vacaCaravana,
        String toroId,
        String toroCaravana,
        BigDecimal score,
        String motivo,
        Boolean recomendado
) {}

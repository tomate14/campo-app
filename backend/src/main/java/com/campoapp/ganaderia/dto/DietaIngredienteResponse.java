package com.campoapp.ganaderia.dto;

import java.math.BigDecimal;

public record DietaIngredienteResponse(
        String id,
        String ingrediente,
        BigDecimal proporcionPct,
        BigDecimal costoKg,
        BigDecimal materiaSecaPct
) {}

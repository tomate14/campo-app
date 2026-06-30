package com.campoapp.finanzas.dto;

import java.math.BigDecimal;

public record CompraItemRequest(
        String insumoId,
        String descripcion,
        BigDecimal cantidad,
        String unidad,
        BigDecimal precioUnitario,
        BigDecimal ivaPorcentaje
) {}

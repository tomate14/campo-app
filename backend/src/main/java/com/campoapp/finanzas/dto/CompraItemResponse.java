package com.campoapp.finanzas.dto;

import java.math.BigDecimal;

public record CompraItemResponse(
        String id,
        String insumoId,
        String insumoNombre,
        String descripcion,
        BigDecimal cantidad,
        String unidad,
        BigDecimal precioUnitario,
        BigDecimal ivaPorcentaje,
        BigDecimal subtotal
) {}

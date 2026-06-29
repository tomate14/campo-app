package com.campoapp.finanzas.dto;

import java.math.BigDecimal;

public record FacturaItemRequest(String insumoId, String descripcion, BigDecimal cantidad, String unidad, BigDecimal precioUnitario, BigDecimal ivaPorcentaje) {}

package com.campoapp.maquinaria.dto;

import java.math.BigDecimal;

public record RepuestoUtilizadoResponse(
        String id,
        String intervencionId,
        String codigo,
        String descripcion,
        BigDecimal cantidad,
        BigDecimal costoUnitario,
        BigDecimal costoTotal,
        String proveedor
) {}

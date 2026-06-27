package com.campoapp.agricultura.dto.insumos;

import com.campoapp.agricultura.entity.insumos.TipoMovimientoInsumo;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record MovimientoInsumoResponse(
        String id,
        String insumoId,
        String insumoNombre,
        String stockId,
        String loteId,
        String loteNombre,
        LocalDateTime fecha,
        TipoMovimientoInsumo tipoMovimiento,
        BigDecimal cantidad,
        BigDecimal costoUnitario,
        BigDecimal costoTotal,
        String responsableId,
        String responsableNombre,
        String tareaReferencia,
        String proveedor,
        String origen,
        String destino,
        String observaciones,
        LocalDateTime createdAt
) {}

package com.campoapp.agricultura.dto.insumos;

import com.campoapp.agricultura.entity.insumos.TipoMovimientoInsumo;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record MovimientoInsumoRequest(
        String insumoId,
        String stockId,
        String loteId,
        LocalDateTime fecha,
        TipoMovimientoInsumo tipoMovimiento,
        BigDecimal cantidad,
        BigDecimal costoUnitario,
        String responsableId,
        String tareaReferencia,
        String proveedor,
        String origen,
        String destino,
        String observaciones
) {}

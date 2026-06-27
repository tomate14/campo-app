package com.campoapp.agricultura.dto.insumos;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record StockInsumoResponse(
        String id,
        String insumoId,
        String insumoNombre,
        String insumoCodigo,
        String loteStock,
        BigDecimal cantidadDisponible,
        LocalDate fechaVencimiento,
        String ubicacionDeposito,
        String deposito,
        String responsableId,
        String responsableNombre,
        String observaciones,
        Boolean vencido,
        Boolean vencimientoProximo,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}

package com.campoapp.agricultura.dto.insumos;

import java.math.BigDecimal;
import java.time.LocalDate;

public record StockInsumoRequest(
        String insumoId,
        String loteStock,
        BigDecimal cantidadDisponible,
        LocalDate fechaVencimiento,
        String ubicacionDeposito,
        String deposito,
        String responsableId,
        String observaciones
) {}

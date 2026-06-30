package com.campoapp.finanzas.dto;

import com.campoapp.finanzas.entity.MetodoPago;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PagoProveedorRequest(
        String compraId,
        String operarioId,
        LocalDate fecha,
        MetodoPago metodoPago,
        BigDecimal importe,
        String referencia,
        String observaciones
) {}

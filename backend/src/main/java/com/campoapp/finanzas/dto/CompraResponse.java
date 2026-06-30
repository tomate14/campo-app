package com.campoapp.finanzas.dto;

import com.campoapp.finanzas.entity.EstadoCompra;
import com.campoapp.finanzas.entity.TipoComprobanteCompra;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record CompraResponse(
        String id,
        String proveedorId,
        String proveedorRazonSocial,
        String proveedorCuit,
        String operarioId,
        String operarioNombre,
        TipoComprobanteCompra tipoComprobante,
        String numeroComprobante,
        LocalDate fechaEmision,
        LocalDate fechaVencimiento,
        EstadoCompra estado,
        BigDecimal subtotal,
        BigDecimal iva,
        BigDecimal total,
        BigDecimal saldoPendiente,
        String observaciones,
        List<CompraItemResponse> items,
        LocalDateTime createdAt
) {}

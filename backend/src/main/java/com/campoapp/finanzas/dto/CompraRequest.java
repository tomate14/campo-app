package com.campoapp.finanzas.dto;

import com.campoapp.finanzas.entity.TipoComprobanteCompra;

import java.time.LocalDate;
import java.util.List;

public record CompraRequest(
        String proveedorId,
        String operarioId,
        TipoComprobanteCompra tipoComprobante,
        String numeroComprobante,
        LocalDate fechaEmision,
        LocalDate fechaVencimiento,
        String observaciones,
        List<CompraItemRequest> items
) {}

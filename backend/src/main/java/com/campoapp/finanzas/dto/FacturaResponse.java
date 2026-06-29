package com.campoapp.finanzas.dto;

import com.campoapp.finanzas.entity.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record FacturaResponse(String id, String clienteId, String clienteRazonSocial, String clienteCuit, String operarioId, String operarioNombre, TipoComprobante tipoComprobante, String puntoVenta, String numeroComprobante, LocalDate fechaEmision, LocalDate fechaVencimiento, EstadoFactura estado, EstadoFiscalAfip estadoFiscal, String cae, LocalDate caeVencimiento, BigDecimal subtotal, BigDecimal iva, BigDecimal total, BigDecimal saldoPendiente, String observaciones, List<FacturaItemResponse> items, LocalDateTime createdAt) {}

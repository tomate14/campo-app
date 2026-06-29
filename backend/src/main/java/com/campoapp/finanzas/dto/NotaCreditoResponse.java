package com.campoapp.finanzas.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record NotaCreditoResponse(String id, String facturaId, String comprobante, String clienteRazonSocial, String operarioId, String operarioNombre, LocalDate fecha, BigDecimal importe, String motivo, String cae, LocalDateTime createdAt) {}

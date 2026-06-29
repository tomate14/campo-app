package com.campoapp.finanzas.dto;

import com.campoapp.finanzas.entity.MetodoPago;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record CobroResponse(String id, String facturaId, String comprobante, String clienteRazonSocial, String operarioId, String operarioNombre, LocalDate fecha, MetodoPago metodoPago, BigDecimal importe, String referencia, String observaciones, LocalDateTime createdAt) {}

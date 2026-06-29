package com.campoapp.finanzas.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record NotaCreditoRequest(String facturaId, String operarioId, LocalDate fecha, BigDecimal importe, String motivo) {}

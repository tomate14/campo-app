package com.campoapp.finanzas.dto;

import com.campoapp.finanzas.entity.TipoComprobante;

import java.time.LocalDate;
import java.util.List;

public record FacturaRequest(String clienteId, String operarioId, TipoComprobante tipoComprobante, String puntoVenta, LocalDate fechaEmision, LocalDate fechaVencimiento, String observaciones, List<FacturaItemRequest> items) {}

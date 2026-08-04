package com.campoapp.agricultura.dto;

import com.campoapp.agricultura.entity.RegistroCosecha.CalidadGrano;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record RegistroCosechaResponse(
        String id,
        String loteId,
        String loteNombre,
        LocalDate fecha,
        BigDecimal rendimientoKgHa,
        BigDecimal toneladasTotal,
        CalidadGrano calidadGrano,
        BigDecimal humedad,
        String observaciones,
        LocalDateTime createdAt,

        // --- Feature 60: perdidas de cosecha ---
        BigDecimal areaRealCosechadaPct,
        BigDecimal hectareasCosechadas,
        BigDecimal perdidaKgHa,
        BigDecimal granosPerdidosKg,
        String tipoPerdida,

        // --- Feature 60: destino del dia ---
        String destino,
        BigDecimal destinoCantidadTn
) {}

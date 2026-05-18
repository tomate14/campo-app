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
        LocalDateTime createdAt
) {}

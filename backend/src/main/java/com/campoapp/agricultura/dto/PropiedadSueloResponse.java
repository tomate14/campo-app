package com.campoapp.agricultura.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record PropiedadSueloResponse(
        String id,
        String loteId,
        String loteNombre,
        LocalDate fecha,
        BigDecimal ph,
        BigDecimal nitrogenoKgHa,
        BigDecimal fosforoKgHa,
        BigDecimal potasioKgHa,
        BigDecimal materiaOrganicaPct,
        BigDecimal conductividadElectrica,
        String observaciones,
        LocalDateTime createdAt
) {}

package com.campoapp.maquinaria.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record IntervencionMantenimientoRequest(
        @NotBlank String maquinariaId,
        String planId,
        String programacionId,
        @NotNull LocalDate fecha,
        @NotBlank String tipo,
        @NotBlank String tareasRealizadas,
        String operario,
        BigDecimal horasMaquina,
        BigDecimal manoObraCosto,
        BigDecimal repuestosCosto,
        BigDecimal costoTotal,
        String estadoResultante,
        String observaciones,
        @Valid List<RepuestoUtilizadoRequest> repuestos
) {}

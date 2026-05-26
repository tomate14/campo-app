package com.campoapp.maquinaria.dto;

import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;

public record PlanMantenimientoRequest(
        String maquinariaId,
        String tipoMaquinaria,
        String modelo,
        @NotBlank String nombre,
        String descripcion,
        BigDecimal intervaloHoras,
        Integer intervaloDias,
        String prioridad,
        Boolean activo
) {}

package com.campoapp.maquinaria.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UsoMaquinariaRequest(
        @NotBlank String maquinariaId,
        @NotNull LocalDate fecha,
        @NotBlank String actividad,
        String lote,
        String operario,
        BigDecimal horasTrabajadas,
        BigDecimal kilometrosRecorridos,
        BigDecimal combustibleLitros,
        String observaciones
) {}

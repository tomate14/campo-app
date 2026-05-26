package com.campoapp.maquinaria.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record RepuestoUtilizadoRequest(
        String codigo,
        @NotBlank String descripcion,
        @NotNull BigDecimal cantidad,
        BigDecimal costoUnitario,
        BigDecimal costoTotal,
        String proveedor
) {}

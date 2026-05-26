package com.campoapp.maquinaria.dto;

import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MaquinariaRequest(
        @NotBlank String codigo,
        @NotBlank String tipo,
        @NotBlank String marca,
        @NotBlank String modelo,
        String numeroSerie,
        Integer anio,
        String estado,
        String ubicacionActual,
        BigDecimal potenciaHp,
        String capacidad,
        String accesorios,
        BigDecimal horometro,
        BigDecimal kilometraje,
        BigDecimal costoAdquisicion,
        LocalDate fechaAlta,
        String observaciones
) {}

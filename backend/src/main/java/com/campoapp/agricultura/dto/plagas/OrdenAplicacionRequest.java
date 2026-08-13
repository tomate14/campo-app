package com.campoapp.agricultura.dto.plagas;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// Alta/edicion de una orden de aplicacion (feature 58).
// responsableId es opcional: si no viene, el backend lo resuelve con el usuario logueado.
public record OrdenAplicacionRequest(
        @NotBlank String loteId,
        @NotBlank String deteccionId,
        LocalDateTime fechaAplicacion,
        @NotBlank String producto,
        String principioActivo,
        @NotNull BigDecimal dosis,
        @NotBlank String unidadDosis,
        BigDecimal volumenCaldoLHa,
        BigDecimal superficieTratadaHa,
        Integer periodoCarenciaDias,
        Integer periodoReingresoHoras,
        String maquinariaId,
        String condicionesClimaticas,
        String observaciones,
        String responsableId,
        @NotBlank String operarioId
) {}

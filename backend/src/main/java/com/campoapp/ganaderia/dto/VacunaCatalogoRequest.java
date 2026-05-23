package com.campoapp.ganaderia.dto;

import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;

public record VacunaCatalogoRequest(
        @NotBlank String codigo,
        @NotBlank String nombre,
        String descripcion,
        Boolean obligatoria,
        String especie,
        Integer frecuenciaDias,
        Integer edadMinDias,
        Integer edadMaxDias,
        String dosisRecomendada,
        String viaAplicacion,
        String laboratorio,
        BigDecimal costoReferencia,
        Integer stockDisponible,
        Boolean activo
) {}

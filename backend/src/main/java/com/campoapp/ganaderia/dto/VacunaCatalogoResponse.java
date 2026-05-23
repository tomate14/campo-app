package com.campoapp.ganaderia.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record VacunaCatalogoResponse(
        String id,
        String codigo,
        String nombre,
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
        Boolean activo,
        LocalDateTime updatedAt
) {}

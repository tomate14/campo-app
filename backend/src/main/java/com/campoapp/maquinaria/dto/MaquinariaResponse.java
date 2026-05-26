package com.campoapp.maquinaria.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record MaquinariaResponse(
        String id,
        String codigo,
        String tipo,
        String marca,
        String modelo,
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
        String observaciones,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}

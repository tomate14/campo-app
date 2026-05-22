package com.campoapp.agricultura.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record LoteResponse(
        String id,
        String nombre,
        BigDecimal area,
        String cultivo,
        BigDecimal latitud,
        BigDecimal longitud,
        String temporada,
        String poligono,
        BigDecimal phMinimo,
        BigDecimal phMaximo,
        LocalDate fechaSiembra,
        LocalDate fechaCosechaEstimada,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}

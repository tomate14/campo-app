package com.campoapp.agricultura.dto;

import java.math.BigDecimal;
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
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}

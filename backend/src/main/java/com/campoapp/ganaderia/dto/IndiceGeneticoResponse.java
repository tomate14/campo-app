package com.campoapp.ganaderia.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record IndiceGeneticoResponse(
        String id,
        String animalId,
        String animalCaravana,
        LocalDate fechaEvaluacion,
        BigDecimal epd,
        BigDecimal dep,
        BigDecimal indiceProductivo,
        String fuente,
        String observaciones,
        LocalDateTime createdAt
) {}

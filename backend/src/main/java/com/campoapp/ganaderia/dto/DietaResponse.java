package com.campoapp.ganaderia.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record DietaResponse(
        String id,
        String nombre,
        String tipoAnimal,
        String objetivo,
        BigDecimal materiaSecaKg,
        BigDecimal costoDiario,
        Boolean activa,
        String observaciones,
        List<DietaIngredienteResponse> ingredientes,
        LocalDateTime updatedAt
) {}

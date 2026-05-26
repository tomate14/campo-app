package com.campoapp.ganaderia.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;
import java.util.List;

public record DietaRequest(
        @NotBlank String nombre,
        @NotBlank String tipoAnimal,
        String objetivo,
        BigDecimal materiaSecaKg,
        BigDecimal costoDiario,
        Boolean activa,
        String observaciones,
        List<@Valid DietaIngredienteRequest> ingredientes
) {}

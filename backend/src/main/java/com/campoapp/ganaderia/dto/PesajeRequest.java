package com.campoapp.ganaderia.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PesajeRequest(
        @NotBlank String animalId,
        @NotNull LocalDate fecha,
        @NotNull BigDecimal pesoKg,
        BigDecimal condicionCorporal,
        String metodo,
        String responsable,
        String observaciones
) {}

package com.campoapp.ganaderia.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AplicacionVacunaRequest(
        @NotBlank String animalId,
        @NotBlank String vacunaId,
        @NotNull LocalDate fechaAplicacion,
        LocalDate proximaDosisFecha,
        String operario,
        String loteMarca,
        BigDecimal costoAplicado,
        String observaciones
) {}

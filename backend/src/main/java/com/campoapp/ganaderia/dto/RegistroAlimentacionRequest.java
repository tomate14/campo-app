package com.campoapp.ganaderia.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record RegistroAlimentacionRequest(
        String animalId,
        String dietaId,
        @NotNull LocalDate fecha,
        @NotBlank String alimento,
        @NotNull BigDecimal cantidadKg,
        BigDecimal costoTotal,
        String potreroId,
        String potrero,
        String responsable,
        String observaciones
) {}

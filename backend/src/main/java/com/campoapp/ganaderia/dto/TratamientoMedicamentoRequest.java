package com.campoapp.ganaderia.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TratamientoMedicamentoRequest(
        @NotBlank String animalId,
        @NotNull LocalDate fechaInicio,
        LocalDate fechaFin,
        @NotBlank String medicamento,
        String dosis,
        String viaAplicacion,
        String responsable,
        String motivo,
        BigDecimal costo,
        String observaciones
) {}

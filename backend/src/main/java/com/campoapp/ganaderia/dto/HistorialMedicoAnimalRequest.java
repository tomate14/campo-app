package com.campoapp.ganaderia.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record HistorialMedicoAnimalRequest(
        @NotBlank String animalId,
        @NotNull LocalDate fecha,
        @NotBlank String diagnostico,
        String tratamiento,
        String veterinario,
        String observaciones
) {}

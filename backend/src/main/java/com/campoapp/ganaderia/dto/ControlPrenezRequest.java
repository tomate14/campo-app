package com.campoapp.ganaderia.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record ControlPrenezRequest(
        @NotBlank String vacaId,
        @NotNull LocalDate fechaDiagnostico,
        @NotBlank String estado,
        LocalDate fechaEstimadaParto,
        String nivelRiesgoParto,
        String veterinario,
        String observaciones
) {}

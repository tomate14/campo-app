package com.campoapp.ganaderia.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record DiagnosticoSanitarioRequest(
        @NotBlank String animalId,
        @NotNull LocalDate fechaDiagnostico,
        @NotBlank String enfermedad,
        String severidad,
        String estado,
        String veterinario,
        String tratamientoIndicado,
        String observaciones
) {}

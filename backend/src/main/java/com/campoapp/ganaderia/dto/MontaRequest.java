package com.campoapp.ganaderia.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record MontaRequest(
        @NotBlank String vacaId,
        @NotBlank String toroId,
        @NotNull LocalDate fecha,
        String resultado,
        String observaciones
) {}

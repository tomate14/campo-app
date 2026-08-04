package com.campoapp.utilidades.dto;

import jakarta.validation.constraints.NotBlank;

public record UtilidadOpcionRequest(
        @NotBlank(message = "La categoria es requerida")
        String categoria,

        @NotBlank(message = "El valor es requerido")
        String valor
) {}

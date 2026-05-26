package com.campoapp.maquinaria.dto;

import jakarta.validation.constraints.NotBlank;

public record EstadoMaquinariaRequest(
        @NotBlank String estado,
        String responsable,
        String motivo
) {}

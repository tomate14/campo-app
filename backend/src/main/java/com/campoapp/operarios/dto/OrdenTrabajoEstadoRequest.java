package com.campoapp.operarios.dto;

import jakarta.validation.constraints.NotBlank;

public record OrdenTrabajoEstadoRequest(
        @NotBlank String estado,
        String responsable,
        String observaciones
) {
}

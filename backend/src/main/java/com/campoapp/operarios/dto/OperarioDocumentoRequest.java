package com.campoapp.operarios.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record OperarioDocumentoRequest(
        @NotBlank String operarioId,
        @NotBlank String tipoDocumento,
        String numero,
        LocalDate fechaEmision,
        LocalDate fechaVencimiento,
        String estado,
        String url,
        String observaciones
) {
}

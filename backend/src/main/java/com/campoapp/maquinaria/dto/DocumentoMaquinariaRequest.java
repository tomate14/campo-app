package com.campoapp.maquinaria.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record DocumentoMaquinariaRequest(
        @NotBlank String maquinariaId,
        @NotBlank String tipoDocumento,
        String numero,
        LocalDate vencimiento,
        String url,
        String observaciones
) {}

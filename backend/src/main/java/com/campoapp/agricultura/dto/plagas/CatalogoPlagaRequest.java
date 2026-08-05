package com.campoapp.agricultura.dto.plagas;

import jakarta.validation.constraints.NotBlank;

public record CatalogoPlagaRequest(
        @NotBlank String nombreComun,
        String nombreCientifico,
        @NotBlank String tipo,
        String cultivosAfectados,
        String descripcion,
        String sintomas,
        String umbralAccion,
        Boolean activo
) {}

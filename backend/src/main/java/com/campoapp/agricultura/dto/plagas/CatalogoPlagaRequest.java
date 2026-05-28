package com.campoapp.agricultura.dto.plagas;

import com.campoapp.agricultura.entity.plagas.TipoPlaga;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CatalogoPlagaRequest(
        @NotBlank String nombreComun,
        String nombreCientifico,
        @NotNull TipoPlaga tipo,
        String cultivosAfectados,
        String descripcion,
        String sintomas,
        String umbralAccion,
        Boolean activo
) {}

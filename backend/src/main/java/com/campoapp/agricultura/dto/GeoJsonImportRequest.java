package com.campoapp.agricultura.dto;

import jakarta.validation.constraints.NotBlank;

public record GeoJsonImportRequest(
        @NotBlank(message = "El contenido GeoJSON es requerido")
        String geoJson
) {}

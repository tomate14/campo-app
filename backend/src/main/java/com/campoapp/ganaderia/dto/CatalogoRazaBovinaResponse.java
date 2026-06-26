package com.campoapp.ganaderia.dto;

import java.time.LocalDateTime;

public record CatalogoRazaBovinaResponse(
        String id,
        String codigo,
        String nombre,
        String especie,
        String aptitud,
        String tipoGenetico,
        String origen,
        String descripcion,
        String fuente,
        Boolean activo,
        LocalDateTime updatedAt
) {}

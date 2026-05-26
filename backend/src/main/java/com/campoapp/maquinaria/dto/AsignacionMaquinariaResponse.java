package com.campoapp.maquinaria.dto;

import java.time.LocalDateTime;

public record AsignacionMaquinariaResponse(
        String id,
        String maquinariaId,
        String maquinariaCodigo,
        String operario,
        LocalDateTime fechaInicio,
        LocalDateTime fechaFin,
        String actividad,
        String ubicacion,
        String observaciones
) {}

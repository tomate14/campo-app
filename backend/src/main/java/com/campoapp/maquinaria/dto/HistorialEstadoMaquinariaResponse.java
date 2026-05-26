package com.campoapp.maquinaria.dto;

import java.time.LocalDateTime;

public record HistorialEstadoMaquinariaResponse(
        String id,
        String maquinariaId,
        String maquinariaCodigo,
        String estadoAnterior,
        String estadoNuevo,
        LocalDateTime fecha,
        String responsable,
        String motivo
) {}
